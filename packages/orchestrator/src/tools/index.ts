/**
 * Auto-discovery for MCP tool modules.
 *
 * Dynamically imports all tool files in the tools/ directory and calls their
 * exported register* function. Convention: each tool file must export a function
 * matching the pattern `register*Tools` or `register*Tool` that takes McpServer.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerAllTools(server: McpServer): Promise<number> {
  const toolsDir = join(__dirname, "tools");
  const files = readdirSync(toolsDir).filter(
    (f) => (f.endsWith(".js") || f.endsWith(".ts")) && f !== "index.ts" && f !== "index.js"
  );

  let count = 0;
  for (const file of files) {
    const modulePath = pathToFileURL(join(toolsDir, file)).href;
    const mod = await import(modulePath);

    // Find the register function (register*Tools or register*Tool)
    const registerFn = Object.values(mod).find(
      (exp) => typeof exp === "function" && (exp as Function).name.startsWith("register")
    ) as ((server: McpServer) => void) | undefined;

    if (registerFn) {
      registerFn(server);
      count++;
    }
  }

  return count;
}
