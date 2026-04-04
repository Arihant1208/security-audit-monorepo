/**
 * API key authentication for the MCP server.
 *
 * Auth priority chain:
 *   1. SECURITY_AUDIT_SKIP_AUTH=true → bypass (stdio / local dev)
 *   2. DATABASE_URL set → hash key with SHA-256, look up in api_keys table
 *   3. SECURITY_AUDIT_API_KEYS env var → comma-separated plaintext key list (simple deploys)
 *   4. Reject
 */

import { createHash } from "node:crypto";
import { findApiKey, touchApiKey, hasDatabase } from "./db.js";

const VALID_KEYS: Set<string> = new Set(
  (process.env.SECURITY_AUDIT_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
);

const SKIP_AUTH = process.env.SECURITY_AUDIT_SKIP_AUTH === "true";

export interface AuthResult {
  authenticated: boolean;
  apiKeyId?: string;
  userId?: string;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(
  key: string | undefined
): Promise<AuthResult> {
  // 1. Skip auth (stdio / local dev)
  if (SKIP_AUTH) {
    return { authenticated: true };
  }

  if (!key) {
    return { authenticated: false };
  }

  // 2. Database lookup
  if (hasDatabase()) {
    const hash = hashKey(key);
    const row = await findApiKey(hash);
    if (row) {
      // Fire-and-forget: update last_used_at
      touchApiKey(row.id).catch(() => {});
      return {
        authenticated: true,
        apiKeyId: row.id,
        userId: row.user_id,
      };
    }
  }

  // 3. Env var fallback
  if (VALID_KEYS.size > 0 && VALID_KEYS.has(key)) {
    return { authenticated: true };
  }

  return { authenticated: false };
}

export async function requireAuth(
  key: string | undefined
): Promise<AuthResult> {
  const result = await validateApiKey(key);
  if (!result.authenticated) {
    throw new Error(
      "Authentication required. Provide a valid API key via the X-API-Key header. " +
        "Get your key at https://security-audit.dev/keys"
    );
  }
  return result;
}
