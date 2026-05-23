import { createHash } from "node:crypto";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { findApiKey, touchApiKey, hasDatabase } from "./db.js";
import { getSQL } from "./sql-client.js";

const VALID_KEYS: Set<string> = new Set(
  (process.env.SECURITY_AUDIT_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
);

const SKIP_AUTH = process.env.SECURITY_AUDIT_SKIP_AUTH === "true";

const clerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

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

/**
 * Validate a Clerk JWT and upsert the user in the database.
 * Returns the user_id or null.
 */
export async function validateClerkJWT(token: string): Promise<string | null> {
  if (!clerk) return null;
  try {
    const { sub } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    if (!sub) return null;

    const sql = getSQL();
    if (!sql) return null;

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE clerk_id = ${sub} LIMIT 1
    `;
    if (existing.length > 0) {
      return existing[0].id as string;
    }

    // Upsert new user from Clerk
    const clerkUser = await clerk.users.getUser(sub);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      email?.split("@")[0] ||
      "User";

    const rows = await sql`
      INSERT INTO users (clerk_id, email, display_name, plan)
      VALUES (${sub}, ${email}, ${displayName}, 'free')
      ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name
      RETURNING id
    `;
    return (rows[0]?.id as string) ?? null;
  } catch (err) {
    console.error("Clerk JWT validation error:", err);
    return null;
  }
}
