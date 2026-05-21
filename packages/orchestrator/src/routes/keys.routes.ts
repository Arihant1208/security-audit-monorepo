/**
 * API Key routes — list, create, revoke
 */

import { Router } from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSQL } from "../sql-client.js";
import { asyncHandler, requireSession, type AuthenticatedRequest } from "../middleware/index.js";

const router = Router();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ── GET /keys ─────────────────────────────────────────────────────────────
router.get("/keys", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const keys = await sql`
    SELECT id, key_prefix, name, created_at, last_used_at, revoked_at
    FROM api_keys WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  res.json({ keys });
}));

// ── POST /keys ────────────────────────────────────────────────────────────
router.post("/keys", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
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
}));

// ── DELETE /keys/:id ──────────────────────────────────────────────────────
router.delete("/keys/:id", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  await sql`
    UPDATE api_keys SET revoked_at = now()
    WHERE id = ${req.params.id} AND user_id = ${userId} AND revoked_at IS NULL
  `;
  res.json({ ok: true });
}));

export { router as keysRouter };
