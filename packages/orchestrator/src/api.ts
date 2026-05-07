/**
 * Steve Website API — Auth, API Keys, Reports, Usage
 *
 * Express router mounted at /api on the orchestrator.
 */

import { Router, type Request, type Response } from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSQL } from "./sql-client.js";

const router = Router();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Simple password hashing with scrypt-like approach using sha256 + salt
// (For production, use bcrypt/argon2 — this avoids native deps for now)
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(s + password).digest("hex");
  return { hash: s + ":" + hash, salt: s };
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = createHash("sha256").update(salt + password).digest("hex");
  return check === hash;
}

// Middleware: require session token
async function requireSession(req: Request, res: Response): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  const token = authHeader.slice(7);
  const sql = getSQL();
  if (!sql) {
    res.status(503).json({ error: "Database not configured" });
    return null;
  }
  const hash = hashToken(token);
  const rows = await sql`
    SELECT s.user_id FROM sessions s
    WHERE s.token_hash = ${hash} AND s.expires_at > now()
    LIMIT 1
  `;
  if (!rows.length) {
    res.status(401).json({ error: "Invalid or expired session" });
    return null;
  }
  return rows[0].user_id as string;
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────
router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    const sql = getSQL();
    if (!sql) { res.status(503).json({ error: "Database not configured" }); return; }

    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const { hash } = hashPassword(password);
    const userId = randomUUID();
    const displayName = name || email.split("@")[0];

    await sql`
      INSERT INTO users (id, clerk_id, email, password_hash, display_name, plan)
      VALUES (${userId}, ${"web_" + userId}, ${email}, ${hash}, ${displayName}, 'free')
    `;

    // Auto-generate first API key
    const rawKey = "sa_live_" + randomBytes(24).toString("hex");
    const keyHash = hashToken(rawKey);
    const keyPrefix = rawKey.slice(0, 12);
    const keyId = randomUUID();

    await sql`
      INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name)
      VALUES (${keyId}, ${userId}, ${keyHash}, ${keyPrefix}, 'Default')
    `;

    // Create session
    const sessionToken = randomBytes(32).toString("hex");
    const sessionHash = hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (${userId}, ${sessionHash}, ${expiresAt})
    `;

    res.status(201).json({
      token: sessionToken,
      user: { id: userId, email, name: displayName, plan: "free" },
      apiKey: rawKey,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const sql = getSQL();
    if (!sql) { res.status(503).json({ error: "Database not configured" }); return; }

    const rows = await sql`
      SELECT id, email, password_hash, display_name, plan
      FROM users WHERE email = ${email} LIMIT 1
    `;
    if (!rows.length || !rows[0].password_hash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (!verifyPassword(password, rows[0].password_hash as string)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = rows[0];
    const sessionToken = randomBytes(32).toString("hex");
    const sessionHash = hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${sessionHash}, ${expiresAt})
    `;

    res.json({
      token: sessionToken,
      user: { id: user.id, email: user.email, name: user.display_name, plan: user.plan },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────
router.post("/auth/logout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const sql = getSQL();
      if (sql) {
        const hash = hashToken(authHeader.slice(7));
        await sql`DELETE FROM sessions WHERE token_hash = ${hash}`;
      }
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get("/auth/me", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const rows = await sql`
      SELECT id, email, display_name, plan, created_at FROM users WHERE id = ${userId}
    `;
    if (!rows.length) { res.status(404).json({ error: "User not found" }); return; }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Auth/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/keys ─────────────────────────────────────────────────────────
router.get("/keys", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const keys = await sql`
      SELECT id, key_prefix, name, created_at, last_used_at, revoked_at
      FROM api_keys WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    res.json({ keys });
  } catch (err) {
    console.error("List keys error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/keys ────────────────────────────────────────────────────────
router.post("/keys", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const name = req.body.name || "API Key";
    const rawKey = "sa_live_" + randomBytes(24).toString("hex");
    const keyHash = hashToken(rawKey);
    const keyPrefix = rawKey.slice(0, 12);
    const keyId = randomUUID();

    await sql`
      INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name)
      VALUES (${keyId}, ${userId}, ${keyHash}, ${keyPrefix}, ${name})
    `;

    res.status(201).json({
      key: { id: keyId, key_prefix: keyPrefix, name, raw_key: rawKey },
    });
  } catch (err) {
    console.error("Create key error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/keys/:id ──────────────────────────────────────────────────
router.delete("/keys/:id", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    await sql`
      UPDATE api_keys SET revoked_at = now()
      WHERE id = ${req.params.id} AND user_id = ${userId} AND revoked_at IS NULL
    `;
    res.json({ ok: true });
  } catch (err) {
    console.error("Revoke key error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/reports ──────────────────────────────────────────────────────
router.get("/reports", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const reports = await sql`
      SELECT id, project_name, status, risk_score, summary, created_at, completed_at
      FROM audit_reports WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.json({ reports });
  } catch (err) {
    console.error("List reports error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/reports/:id ──────────────────────────────────────────────────
router.get("/reports/:id", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const rows = await sql`
      SELECT * FROM audit_reports
      WHERE id = ${req.params.id} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!rows.length) { res.status(404).json({ error: "Report not found" }); return; }

    res.json({ report: rows[0] });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/reports ─────────────────────────────────────────────────────
router.post("/reports", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const { project_name, status, risk_score, summary, business_context, findings, pipeline_state } = req.body;

    if (!project_name) {
      res.status(400).json({ error: "project_name is required" });
      return;
    }

    const validStatuses = ["running", "completed", "failed"];
    const reportStatus = validStatuses.includes(status) ? status : "completed";

    if (risk_score !== undefined && (typeof risk_score !== "number" || risk_score < 0 || risk_score > 10)) {
      res.status(400).json({ error: "risk_score must be a number between 0 and 10" });
      return;
    }

    const rows = await sql`
      INSERT INTO audit_reports (user_id, project_name, status, risk_score, summary, business_context, findings, pipeline_state, completed_at)
      VALUES (
        ${userId},
        ${project_name},
        ${reportStatus},
        ${risk_score ?? null},
        ${summary ? JSON.stringify(summary) : null}::jsonb,
        ${business_context ? JSON.stringify(business_context) : null}::jsonb,
        ${findings ? JSON.stringify(findings) : null}::jsonb,
        ${pipeline_state ? JSON.stringify(pipeline_state) : null}::jsonb,
        ${reportStatus === "completed" ? new Date().toISOString() : null}
      )
      RETURNING id, project_name, status, risk_score, created_at
    `;

    res.status(201).json({ report: rows[0] });
  } catch (err) {
    console.error("Create report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/usage ────────────────────────────────────────────────────────
router.get("/usage", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const [total] = await sql`
      SELECT COUNT(*)::int as total,
             COUNT(DISTINCT DATE(ul.created_at))::int as active_days
      FROM usage_logs ul
      JOIN api_keys ak ON ul.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
    `;

    const recent = await sql`
      SELECT ul.tool_name, COUNT(*)::int as calls, AVG(ul.latency_ms)::int as avg_ms
      FROM usage_logs ul
      JOIN api_keys ak ON ul.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ul.created_at > now() - interval '30 days'
      GROUP BY ul.tool_name
      ORDER BY calls DESC
    `;

    const daily = await sql`
      SELECT DATE(ul.created_at) as date, COUNT(*)::int as calls
      FROM usage_logs ul
      JOIN api_keys ak ON ul.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ul.created_at > now() - interval '30 days'
      GROUP BY DATE(ul.created_at)
      ORDER BY date
    `;

    res.json({ total: total || { total: 0, active_days: 0 }, by_tool: recent, daily });
  } catch (err) {
    console.error("Usage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as apiRouter };
