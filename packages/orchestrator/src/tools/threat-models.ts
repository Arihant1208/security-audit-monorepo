import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile } from "../infra/data.js";

const TEMPLATE_MAP: Record<string, string> = {
  stride: "stride-template",
  "data-flow": "data-flow-diagram-guide",
  "threat-scenario": "threat-scenario-template",
};

export function registerThreatModelTools(server: McpServer): void {
  server.tool(
    "list-threat-models",
    "List available threat model templates (STRIDE, data flow, threat scenario).",
    {},
    async () => {
      const items = Object.entries(TEMPLATE_MAP).map(([id, file]) => ({
        id,
        name: file.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }],
      };
    }
  );

  server.tool(
    "get-threat-model",
    "Get a specific threat model template.",
    {
      template: z.enum(["stride", "data-flow", "threat-scenario"]).describe("Template ID"),
    },
    async ({ template }) => {
      const file = TEMPLATE_MAP[template];
      const content = readDataFile("threat-models", `${file}.md`);
      return { content: [{ type: "text" as const, text: content }] };
    }
  );
}
