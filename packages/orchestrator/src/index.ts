#!/usr/bin/env node

/**
 * Steve — End-to-End Autonomous Security Agent
 *
 * MCP Server + Pipeline Orchestration Engine
 *
 * Serves security audit capabilities via the Model Context Protocol.
 * Supports two transports:
 *   - stdio  (local/enterprise): node dist/index.js --stdio
 *   - HTTP   (remote/SaaS):      node dist/index.js [--port 3000]
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { requireAuth } from "./infra/auth.js";
import { apiRouter } from "./api.js";
import { registerAllTools } from "./tools/index.js";
import { startWorker, stopWorker } from "./pipeline/worker.js";

const VERSION = "2.0.0";

async function createServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "steve-security-agent",
    version: VERSION,
  });

  const toolCount = await registerAllTools(server);
  console.error(`Registered ${toolCount} tool modules`);

  return server;
}

// ---------------------------------------------------------------------------
// Transport: stdio (local / enterprise)
// ---------------------------------------------------------------------------
async function startStdio(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Steve Security Agent running on stdio (v" + VERSION + ")");
}

// ---------------------------------------------------------------------------
// Transport: HTTP/SSE (remote / SaaS)
// ---------------------------------------------------------------------------
async function startHttp(port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  // Configurable CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? ["*"];
  app.use((_req, res, next) => {
    const origin = _req.headers.origin;
    if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization, mcp-session-id");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Expose-Headers", "mcp-session-id");
    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  const sessions = new Map<string, StreamableHTTPServerTransport>();
  const SESSION_TTL_MS = 30 * 60 * 1000;
  const sessionTimestamps = new Map<string, number>();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, ts] of sessionTimestamps) {
      if (now - ts > SESSION_TTL_MS) {
        const transport = sessions.get(id);
        if (transport) {
          transport.close().catch(() => {});
          sessions.delete(id);
        }
        sessionTimestamps.delete(id);
      }
    }
  }, SESSION_TTL_MS);
  cleanupInterval.unref();

  // POST /mcp
  app.post("/mcp", async (req, res) => {
    try {
      await requireAuth(req.headers["x-api-key"] as string | undefined);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unauthorized";
      res.status(401).json({ error: message });
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
      });
      sessions.set(newSessionId, transport);
      sessionTimestamps.set(newSessionId, Date.now());
      const server = await createServer();
      await server.connect(transport);
    } else {
      res.status(400).json({ error: "Bad request: no valid session" });
      return;
    }

    const activeSessionId = req.headers["mcp-session-id"] as string | undefined;
    if (activeSessionId) {
      sessionTimestamps.set(activeSessionId, Date.now());
    }

    await transport.handleRequest(req, res, req.body);
  });

  // GET /mcp — SSE
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // DELETE /mcp
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId)!;
      await transport.close();
      sessions.delete(sessionId);
      sessionTimestamps.delete(sessionId);
    }
    res.status(200).json({ status: "session closed" });
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      agent: "steve-security-agent",
      version: VERSION,
      tools: 20,
      phases: 9,
    });
  });

  // ── Website API ────────────────────────────────────────────────────────
  app.use("/api", apiRouter);

  // ── Static site serving ────────────────────────────────────────────────
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const siteDir = join(__dirname, "..", "..", "site");
  app.use(express.static(siteDir));
  // SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/mcp") || req.path.startsWith("/api") || req.path.startsWith("/health")) {
      next();
      return;
    }
    res.sendFile(join(siteDir, "index.html"));
  });

  const server = app.listen(port, () => {
    console.error(`Steve Security Agent listening on http://localhost:${port}/mcp (v${VERSION})`);

    // Start background job worker if database is configured
    if (process.env.DATABASE_URL) {
      startWorker();
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.error("Shutting down...");
    stopWorker();
    clearInterval(cleanupInterval);
    for (const [, transport] of sessions) {
      transport.close().catch(() => {});
    }
    sessions.clear();
    server.close();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// ---------------------------------------------------------------------------
// Helpers & Entry Point
// ---------------------------------------------------------------------------
function isInitializeRequest(body: unknown): boolean {
  if (typeof body === "object" && body !== null && "method" in body) {
    return (body as { method: string }).method === "initialize";
  }
  if (Array.isArray(body)) {
    return body.some(
      (msg) => typeof msg === "object" && msg !== null && msg.method === "initialize"
    );
  }
  return false;
}

const args = process.argv.slice(2);

if (args.includes("--stdio")) {
  startStdio().catch((err) => {
    console.error("Failed to start Steve (stdio):", err);
    process.exit(1);
  });
} else {
  const portArg = args.find((a) => a.startsWith("--port"));
  const port = portArg ? parseInt(portArg.split("=")[1] || args[args.indexOf(portArg) + 1]) : parseInt(process.env.PORT ?? "3000");
  startHttp(port).catch((err) => {
    console.error("Failed to start Steve (HTTP):", err);
    process.exit(1);
  });
}

