import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile } from "../data.js";

const PHASE_MAP: Record<number, string> = {
  1: "01-system-discovery",
  2: "02-threat-modeling",
  3: "03-attack-surface-mapping",
  4: "04-layered-security-audit",
  5: "05-vulnerability-identification",
  6: "06-risk-scoring",
  7: "07-remediation-planning",
};

export function registerMethodologyTools(server: McpServer): void {
  server.tool(
    "get-methodology",
    "Get methodology instructions for a specific audit phase (1–7).",
    {
      phase: z.number().int().min(1).max(7).describe("Audit phase number (1-7)"),
    },
    async ({ phase }) => {
      const file = PHASE_MAP[phase];
      const content = readDataFile("methodology", `${file}.md`);
      return { content: [{ type: "text" as const, text: content }] };
    }
  );
}
