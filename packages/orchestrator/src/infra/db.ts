import { getSQL } from "./sql-client.js";

export interface ApiKeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  revoked_at: string | null;
}

export async function findApiKey(keyHash: string): Promise<ApiKeyRow | null> {
  const sql = getSQL();
  if (!sql) return null;

  const rows = await sql`
    SELECT id, user_id, key_hash, key_prefix, name, revoked_at
    FROM api_keys
    WHERE key_hash = ${keyHash}
      AND revoked_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as unknown as ApiKeyRow) ?? null;
}

export async function touchApiKey(apiKeyId: string): Promise<void> {
  const sql = getSQL();
  if (!sql) return;

  await sql`
    UPDATE api_keys SET last_used_at = now() WHERE id = ${apiKeyId}
  `;
}

export async function logUsage(
  apiKeyId: string,
  toolName: string,
  latencyMs: number
): Promise<void> {
  const sql = getSQL();
  if (!sql) return;

  await sql`
    INSERT INTO usage_logs (api_key_id, tool_name, latency_ms)
    VALUES (${apiKeyId}, ${toolName}, ${latencyMs})
  `;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}
