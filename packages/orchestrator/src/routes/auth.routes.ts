/**
 * Auth routes — signup, login, logout, me
 */

import { Router, type Response } from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { getSQL } from "../sql-client.js";
import { asyncHandler, AppError, validate, requireSession, type AuthenticatedRequest } from "../middleware/index.js";
import { authLimiter } from "../middleware/rate-limit.js";

const router = Router();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

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

const signupSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

// ── POST /auth/signup ─────────────────────────────────────────────────────
router.post("/auth/signup", authLimiter, validate(signupSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const sql = getSQL();
  if (!sql) throw new AppError(503, "Database not configured");

  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) throw new AppError(409, "Email already registered");

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
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${sessionHash}, ${expiresAt})
  `;

  res.status(201).json({
    token: sessionToken,
    user: { id: userId, email, name: displayName, plan: "free" },
    apiKey: rawKey,
  });
}));

// ── POST /auth/login ──────────────────────────────────────────────────────
router.post("/auth/login", authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const sql = getSQL();
  if (!sql) throw new AppError(503, "Database not configured");

  const rows = await sql`
    SELECT id, email, password_hash, display_name, plan
    FROM users WHERE email = ${email} LIMIT 1
  `;
  if (!rows.length || !rows[0].password_hash) {
    throw new AppError(401, "Invalid email or password");
  }
  if (!verifyPassword(password, rows[0].password_hash as string)) {
    throw new AppError(401, "Invalid email or password");
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
}));

// ── POST /auth/logout ─────────────────────────────────────────────────────
router.post("/auth/logout", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const sql = getSQL();
    if (sql) {
      const hash = hashToken(authHeader.slice(7));
      await sql`DELETE FROM sessions WHERE token_hash = ${hash}`;
    }
  }
  res.json({ ok: true });
}));

// ── GET /auth/me ──────────────────────────────────────────────────────────
router.get("/auth/me", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const rows = await sql`
    SELECT id, email, display_name, plan, created_at FROM users WHERE id = ${userId}
  `;
  if (!rows.length) throw new AppError(404, "User not found");

  res.json({ user: rows[0] });
}));

export { router as authRouter };
