/**
 * Steve Website API — Auth, API Keys, Reports, Usage, Teams
 *
 * Express router mounted at /api on the orchestrator.
 * Supports both legacy session tokens and Clerk JWT authentication.
 */

import { Router, type Request, type Response } from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSQL } from "./sql-client.js";
import { validateClerkJWT } from "./auth.js";

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

// Middleware: require session token or Clerk JWT
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

  // Try Clerk JWT first
  const clerkUserId = await validateClerkJWT(token);
  if (clerkUserId) return clerkUserId;

  // Fallback to legacy session token
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

    // Include team reports if user belongs to a team
    const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
    const teamId = userRow[0]?.team_id as string | null;

    let reports;
    if (teamId) {
      reports = await sql`
        SELECT r.id, r.project_name, r.status, r.risk_score, r.summary, r.created_at, r.completed_at,
               u.display_name as author_name
        FROM audit_reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.user_id = ${userId} OR r.team_id = ${teamId}
        ORDER BY r.created_at DESC
        LIMIT 50
      `;
    } else {
      reports = await sql`
        SELECT id, project_name, status, risk_score, summary, created_at, completed_at
        FROM audit_reports WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }
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

    // Allow access if user owns report or is on the same team
    const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
    const teamId = userRow[0]?.team_id as string | null;

    let rows;
    if (teamId) {
      rows = await sql`
        SELECT * FROM audit_reports
        WHERE id = ${req.params.id} AND (user_id = ${userId} OR team_id = ${teamId})
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT * FROM audit_reports
        WHERE id = ${req.params.id} AND user_id = ${userId}
        LIMIT 1
      `;
    }
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

    const { project_name, status, risk_score, summary, business_context, findings, pipeline_state, phase_outputs } = req.body;

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

    // Attach team_id if user is on a team
    const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
    const teamId = userRow[0]?.team_id ?? null;

    const rows = await sql`
      INSERT INTO audit_reports (user_id, team_id, project_name, status, risk_score, summary, business_context, findings, pipeline_state, phase_outputs, completed_at)
      VALUES (
        ${userId},
        ${teamId},
        ${project_name},
        ${reportStatus},
        ${risk_score ?? null},
        ${summary ? JSON.stringify(summary) : null}::jsonb,
        ${business_context ? JSON.stringify(business_context) : null}::jsonb,
        ${findings ? JSON.stringify(findings) : null}::jsonb,
        ${pipeline_state ? JSON.stringify(pipeline_state) : null}::jsonb,
        ${phase_outputs ? JSON.stringify(phase_outputs) : null}::jsonb,
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

// ══════════════════════════════════════════════════════════════════════════
// TEAMS
// ══════════════════════════════════════════════════════════════════════════

// ── GET /api/team ─────────────────────────────────────────────────────────
router.get("/team", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
    const teamId = userRow[0]?.team_id as string | null;

    if (!teamId) {
      res.json({ team: null });
      return;
    }

    const [team] = await sql`SELECT id, name, created_at FROM teams WHERE id = ${teamId}`;
    if (!team) {
      res.json({ team: null });
      return;
    }

    const members = await sql`
      SELECT tm.id, tm.user_id, tm.role, tm.joined_at,
             u.email, u.display_name
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${teamId}
      ORDER BY tm.joined_at ASC
    `;

    res.json({ team: { ...team, members } });
  } catch (err) {
    console.error("Get team error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/teams ───────────────────────────────────────────────────────
router.post("/teams", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ error: "Team name is required" });
      return;
    }

    // Check if user already on a team
    const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
    if (userRow[0]?.team_id) {
      res.status(409).json({ error: "You are already on a team" });
      return;
    }

    const teamId = randomUUID();
    await sql`INSERT INTO teams (id, name) VALUES (${teamId}, ${name.trim()})`;

    // Add creator as admin
    await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${teamId}, ${userId}, 'admin')
    `;

    // Set user's team_id
    await sql`UPDATE users SET team_id = ${teamId} WHERE id = ${userId}`;

    res.status(201).json({ team: { id: teamId, name: name.trim(), members: [] } });
  } catch (err) {
    console.error("Create team error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/teams/:id/invite ────────────────────────────────────────────
router.post("/teams/:id/invite", async (req: Request, res: Response) => {
  try {
    const userId = await requireSession(req, res);
    if (!userId) return;
    const sql = getSQL()!;

    const teamId = req.params.id;
    const { email } = req.body;
    if (!email?.trim()) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Verify user is admin of this team
    const membership = await sql`
      SELECT role FROM team_members
      WHERE team_id = ${teamId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!membership.length || membership[0].role !== "admin") {
      res.status(403).json({ error: "Only team admins can invite members" });
      return;
    }

    // Check if user already on team
    const existingMember = await sql`
      SELECT u.id FROM users u
      JOIN team_members tm ON tm.user_id = u.id AND tm.team_id = ${teamId}
      WHERE u.email = ${email.trim()}
      LIMIT 1
    `;
    if (existingMember.length) {
      res.status(409).json({ error: "User is already a team member" });
      return;
    }

    // Check if invited user exists — if so, add directly
    const invitedUser = await sql`
      SELECT id FROM users WHERE email = ${email.trim()} LIMIT 1
    `;
    if (invitedUser.length) {
      const iUserId = invitedUser[0].id as string;
      await sql`
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (${teamId}, ${iUserId}, 'member')
        ON CONFLICT (team_id, user_id) DO NOTHING
      `;
      await sql`UPDATE users SET team_id = ${teamId} WHERE id = ${iUserId}`;
      res.json({ ok: true, added_directly: true });
    } else {
      // Create invite token for future signup
      const token = randomBytes(32).toString("hex");
      await sql`
        INSERT INTO team_invites (team_id, email, invited_by, token)
        VALUES (${teamId}, ${email.trim()}, ${userId}, ${token})
      `;
      res.json({ ok: true, invite_token: token });
    }
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/teams/:id/members/:userId ─────────────────────────────────
router.delete("/teams/:id/members/:userId", async (req: Request, res: Response) => {
  try {
    const currentUserId = await requireSession(req, res);
    if (!currentUserId) return;
    const sql = getSQL()!;

    const teamId = req.params.id;
    const targetUserId = req.params.userId;

    // Verify current user is admin
    const membership = await sql`
      SELECT role FROM team_members
      WHERE team_id = ${teamId} AND user_id = ${currentUserId}
      LIMIT 1
    `;
    if (!membership.length || membership[0].role !== "admin") {
      res.status(403).json({ error: "Only team admins can remove members" });
      return;
    }

    // Can't remove yourself as admin
    if (targetUserId === currentUserId) {
      res.status(400).json({ error: "Cannot remove yourself. Transfer admin role first." });
      return;
    }

    await sql`DELETE FROM team_members WHERE team_id = ${teamId} AND user_id = ${targetUserId}`;
    await sql`UPDATE users SET team_id = NULL WHERE id = ${targetUserId} AND team_id = ${teamId}`;

    res.json({ ok: true });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PATCH /api/teams/:id/members/:userId ──────────────────────────────────
router.patch("/teams/:id/members/:userId", async (req: Request, res: Response) => {
  try {
    const currentUserId = await requireSession(req, res);
    if (!currentUserId) return;
    const sql = getSQL()!;

    const teamId = req.params.id;
    const targetUserId = req.params.userId;
    const { role } = req.body;

    const validRoles = ["admin", "member", "viewer"];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be admin, member, or viewer." });
      return;
    }

    // Verify current user is admin
    const membership = await sql`
      SELECT role FROM team_members
      WHERE team_id = ${teamId} AND user_id = ${currentUserId}
      LIMIT 1
    `;
    if (!membership.length || membership[0].role !== "admin") {
      res.status(403).json({ error: "Only team admins can change roles" });
      return;
    }

    await sql`
      UPDATE team_members SET role = ${role}
      WHERE team_id = ${teamId} AND user_id = ${targetUserId}
    `;

    res.json({ ok: true });
  } catch (err) {
    console.error("Change role error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as apiRouter };
