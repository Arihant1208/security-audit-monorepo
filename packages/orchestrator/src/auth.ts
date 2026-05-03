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
  if (SKIP_AUTH) {
    return { authenticated: true };
  }

  if (!key) {
    return { authenticated: false };
  }

  if (hasDatabase()) {
    const hash = hashKey(key);
    const row = await findApiKey(hash);
    if (row) {
      touchApiKey(row.id).catch(() => {});
      return {
        authenticated: true,
        apiKeyId: row.id,
        userId: row.user_id,
      };
    }
  }

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
      "Authentication required. Provide a valid API key via the X-API-Key header."
    );
  }
  return result;
}
