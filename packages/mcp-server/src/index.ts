#!/usr/bin/env node

/**
 * Security Audit Framework — MCP Server
 *
 * Serves security audit knowledge (checklists, attack patterns, remediation
 * guides, templates, risk scoring) via the Model Context Protocol.
 *
 * Supports two transports:
 *   - stdio  (local/enterprise): node dist/index.js --stdio
 *   - HTTP   (remote/SaaS):      node dist/index.js [--port 3000]
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { requireAuth } from "./auth.js";
import { registerChecklistTools } from "./tools/checklists.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-base.js";
import { registerRiskScoringTools } from "./tools/risk-scoring.js";
import { registerRemediationTools } from "./tools/remediation.js";
import { registerReportingTools } from "./tools/reporting.js";
import { registerMethodologyTools } from "./tools/methodology.js";
import { registerThreatModelTools } from "./tools/threat-models.js";

const VERSION = "1.1.0";

function createServer(): McpServer {
  const server = new McpServer({
    name: "security-audit",
    version: VERSION,
  });

  // Register all tool groups
  registerChecklistTools(server);
  registerKnowledgeBaseTools(server);
  registerRiskScoringTools(server);
  registerRemediationTools(server);
  registerReportingTools(server);
  registerMethodologyTools(server);
  registerThreatModelTools(server);

  return server;
}

// ---------------------------------------------------------------------------
// Transport: stdio (local / enterprise)
// ---------------------------------------------------------------------------
async function startStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Security Audit MCP server running on stdio");
}

// ---------------------------------------------------------------------------
// Transport: HTTP/SSE (remote / SaaS)
// ---------------------------------------------------------------------------
async function startHttp(port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  // CORS headers for cross-origin MCP clients
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key, mcp-session-id");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Expose-Headers", "mcp-session-id");
    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Session store for Streamable HTTP transport
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // Clean up stale sessions every 30 minutes
  const SESSION_TTL_MS = 30 * 60 * 1000;
  const sessionTimestamps = new Map<string, number>();
  setInterval(() => {
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
  }, SESSION_TTL_MS).unref();

  // POST /mcp — tool calls & initialization
  app.post("/mcp", async (req, res) => {
    // Auth check
    try {
      await requireAuth(req.headers["x-api-key"] as string | undefined);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unauthorized";
      res.status(401).json({ error: message });
      return;
    }

    // Check for existing session
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
      });
      sessions.set(newSessionId, transport);
      sessionTimestamps.set(newSessionId, Date.now());
      const server = createServer();
      await server.connect(transport);
    } else {
      res.status(400).json({ error: "Bad request: no valid session" });
      return;
    }

    // Refresh session timestamp on activity
    const activeSessionId = req.headers["mcp-session-id"] as string | undefined;
    if (activeSessionId) {
      sessionTimestamps.set(activeSessionId, Date.now());
    }

    await transport.handleRequest(req, res, req.body);
  });

  // GET /mcp — SSE stream for server-to-client notifications
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // DELETE /mcp — session cleanup
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
    res.json({ status: "ok", server: "security-audit-mcp", version: VERSION });
  });

  app.listen(port, () => {
    console.error(`Security Audit MCP server listening on http://localhost:${port}/mcp`);
  });
}

// ---------------------------------------------------------------------------
// Helpers
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

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes("--stdio")) {
  startStdio().catch((err) => {
    console.error("Failed to start stdio transport:", err);
    process.exit(1);
  });
} else {
  const portIndex = args.indexOf("--port");
  const port = portIndex !== -1
    ? parseInt(args[portIndex + 1], 10)
    : parseInt(process.env.PORT || "3000", 10);
  startHttp(port).catch((err) => {
    console.error("Failed to start HTTP transport:", err);
    process.exit(1);
  });
}
