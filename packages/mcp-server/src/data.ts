import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "..", "..", "data");

/**
 * Read a markdown file from the data directory.
 * Path traversal is prevented by resolving and checking the prefix.
 */
export function readDataFile(...segments: string[]): string {
  const resolved = resolve(DATA_DIR, ...segments);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }
  if (!existsSync(resolved)) {
    throw new Error(`Data file not found: ${segments.join("/")}`);
  }
  return readFileSync(resolved, "utf-8");
}

/**
 * List markdown files in a data subdirectory.
 * Returns filenames without extension.
 */
export function listDataFiles(...segments: string[]): string[] {
  const dir = resolve(DATA_DIR, ...segments);
  if (!dir.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => basename(f, ".md"));
}

/**
 * List subdirectories in a data directory.
 */
export function listDataDirs(...segments: string[]): string[] {
  const dir = resolve(DATA_DIR, ...segments);
  if (!dir.startsWith(DATA_DIR)) {
    throw new Error("Access denied: path traversal detected");
  }
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}
