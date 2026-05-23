import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile } from "../infra/data.js";

const CHECKLIST_MAP: Record<string, string> = {
  architecture: "01-architecture",
  "identity-access": "02-identity-access",
  "application-security": "03-application-security",
  "api-security": "04-api-security",
  "data-security": "05-data-security",
  "network-security": "06-network-security",
  "infrastructure-cloud": "07-infrastructure-cloud",
  "devops-cicd": "08-devops-cicd",
  "supply-chain": "09-supply-chain",
  "client-side": "10-client-side",
  "monitoring-logging": "11-monitoring-logging",
  "business-logic": "12-business-logic",
};

export function registerChecklistTools(server: McpServer): void {
  server.tool(
    "list-checklists",
    "List all available security audit checklists by layer. Returns checklist IDs and names.",
    {},
    async () => {
      const items = Object.entries(CHECKLIST_MAP).map(([id, file]) => {
        const num = file.split("-")[0];
        const name = file
          .replace(/^\d+-/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return { id, number: num, name };
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }],
      };
    }
  );

  server.tool(
    "get-checklist",
    "Get the full security audit checklist for a specific layer.",
    { layer: z.string().describe("Checklist layer ID, e.g. 'application-security'") },
    async ({ layer }) => {
      const file = CHECKLIST_MAP[layer];
      if (!file) {
        const valid = Object.keys(CHECKLIST_MAP).join(", ");
        return {
          content: [{ type: "text" as const, text: `Unknown layer "${layer}". Valid: ${valid}` }],
          isError: true,
        };
      }
      const content = readDataFile("audit-checklists", `${file}.md`);
      return { content: [{ type: "text" as const, text: content }] };
    }
  );
}
