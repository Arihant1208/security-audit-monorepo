import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Knowledge base lives at the repo root data/ directory
const DATA_DIR = resolve(__dirname, "..", "..", "..", "data");

// ── In-memory cache for data files (loaded once, never changes at runtime) ──
const fileCache = new Map<string, string>();
const listCache = new Map<string, string[]>();

/**
 * Read a markdown file from the data directory.
 * Path traversal is prevented by resolving and checking the prefix.
 * Results are cached in memory for the lifetime of the process.
 */
export function readDataFile(...segments: string[]): string {
  const resolved = resolve(DATA_DIR, ...segments);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }

  const cached = fileCache.get(resolved);
  if (cached !== undefined) return cached;

  if (!existsSync(resolved)) {
    throw new Error(`Data file not found: ${segments.join("/")}`);
  }
  const content = readFileSync(resolved, "utf-8");
  fileCache.set(resolved, content);
  return content;
}

/**
 * List markdown files in a data subdirectory.
 * Returns filenames without extension. Cached.
 */
export function listDataFiles(...segments: string[]): string[] {
  const dir = resolve(DATA_DIR, ...segments);
  if (!dir.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }

  const cacheKey = "files:" + dir;
  const cached = listCache.get(cacheKey);
  if (cached) return cached;

  if (!existsSync(dir)) {
    return [];
  }
  const result = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => basename(f, ".md"));
  listCache.set(cacheKey, result);
  return result;
}

/**
 * List subdirectories in a data directory. Cached.
 */
export function listDataDirs(...segments: string[]): string[] {
  const dir = resolve(DATA_DIR, ...segments);
  if (!dir.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }

  const cacheKey = "dirs:" + dir;
  const cached = listCache.get(cacheKey);
  if (cached) return cached;

  if (!existsSync(dir)) {
    return [];
  }
  const result = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  listCache.set(cacheKey, result);
  return result;
}
