import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

function getClient() {
  if (!DATABASE_URL) return null;
  return neon(DATABASE_URL);
}

export interface ApiKeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  revoked_at: string | null;
}

/**
 * Look up an API key by its SHA-256 hash.
 * Returns the key row if found and not revoked, null otherwise.
 */
export async function findApiKey(
  keyHash: string
): Promise<ApiKeyRow | null> {
  const sql = getClient();
  if (!sql) return null;

  const rows = await sql`
    SELECT id, user_id, key_hash, key_prefix, name, revoked_at
    FROM api_keys
    WHERE key_hash = ${keyHash}
      AND revoked_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as ApiKeyRow) ?? null;
}

/**
 * Update the last_used_at timestamp for an API key.
 */
export async function touchApiKey(apiKeyId: string): Promise<void> {
  const sql = getClient();
  if (!sql) return;

  await sql`
    UPDATE api_keys SET last_used_at = now() WHERE id = ${apiKeyId}
  `;
}

/**
 * Log a tool invocation for usage tracking.
 */
export async function logUsage(
  apiKeyId: string,
  toolName: string,
  latencyMs: number
): Promise<void> {
  const sql = getClient();
  if (!sql) return;

  await sql`
    INSERT INTO usage_logs (api_key_id, tool_name, latency_ms)
    VALUES (${apiKeyId}, ${toolName}, ${latencyMs})
  `;
}

/**
 * Check if a database connection is configured.
 */
export function hasDatabase(): boolean {
  return !!DATABASE_URL;
}
