/**
 * Drizzle ORM client — ready to use in new code.
 * Existing raw SQL queries continue to work via sql-client.ts.
 * Migrate incrementally: new queries use Drizzle, old ones stay until touched.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not set — cannot initialize Drizzle");
  }

  const pool = new pg.Pool({ connectionString, max: 10 });
  _db = drizzle(pool, { schema });
  return _db;
}

export { schema };
