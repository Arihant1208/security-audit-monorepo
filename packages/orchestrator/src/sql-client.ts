/**
 * Unified SQL client — picks pg (local/standard Postgres) or @neondatabase/serverless
 * based on the DATABASE_URL.
 *
 * Neon's serverless driver uses HTTP fetch and only works with Neon's cloud proxy.
 * Standard pg uses TCP sockets and works with any Postgres instance.
 *
 * Auto-detection: if the URL contains "neon.tech" or "neon.cc", use Neon driver.
 * Otherwise (localhost, Docker, RDS, Cloud SQL, etc.), use pg.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import pg from "pg";

const { Pool } = pg;

export type SQLQuery = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

let _pool: pg.Pool | null = null;

function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neon.cc");
}

function getPgPool(url: string): pg.Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: url, max: 10 });
  }
  return _pool;
}

/**
 * Wraps pg.Pool.query to match the tagged-template interface of neon().
 */
function createPgTaggedTemplate(url: string): SQLQuery {
  const pool = getPgPool(url);
  return async (strings: TemplateStringsArray, ...values: unknown[]) => {
    // Build a parameterized query: "SELECT * FROM users WHERE id = $1"
    let text = "";
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) {
        text += `$${i + 1}`;
      }
    }
    const result = await pool.query(text, values);
    return result.rows;
  };
}

/**
 * Returns a tagged-template SQL function, or null if no DATABASE_URL is set.
 * Works with both Neon cloud URLs and standard Postgres URLs.
 */
export function getSQL(): SQLQuery | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (isNeonUrl(url)) {
    return neon(url) as unknown as SQLQuery;
  }
  return createPgTaggedTemplate(url);
}

/**
 * Gracefully close the pg pool (for shutdown).
 */
export async function closePgPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
