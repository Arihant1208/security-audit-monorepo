/**
 * Session authentication middleware.
 * Extracts user ID from Bearer token (session or Clerk JWT).
 */

import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import { getSQL } from "../sql-client.js";
import { validateClerkJWT } from "../auth.js";
import { AppError } from "./errors.js";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Express middleware that requires a valid session.
 * Sets req.userId on success; throws AppError on failure.
 */
export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const token = authHeader.slice(7);
  const sql = getSQL();
  if (!sql) {
    throw new AppError(503, "Database not configured");
  }

  // Try Clerk JWT first
  const clerkUserId = await validateClerkJWT(token);
  if (clerkUserId) {
    (req as AuthenticatedRequest).userId = clerkUserId;
    next();
    return;
  }

  // Fallback to session token
  const hash = hashToken(token);
  const rows = await sql`
    SELECT s.user_id FROM sessions s
    WHERE s.token_hash = ${hash} AND s.expires_at > now()
    LIMIT 1
  `;
  if (!rows.length) {
    throw new AppError(401, "Invalid or expired session");
  }

  (req as AuthenticatedRequest).userId = rows[0].user_id as string;
  next();
}

/** Request with authenticated userId attached. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}
