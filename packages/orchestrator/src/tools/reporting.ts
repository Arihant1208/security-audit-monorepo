import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile } from "../infra/data.js";

const TEMPLATE_MAP: Record<string, string> = {
  audit: "audit-report-template",
  executive: "executive-summary-template",
  vulnerability: "vulnerability-report-template",
};

const COMPLIANCE_MAP: Record<string, string> = {
  owasp: "owasp-top-10",
  nist: "nist-csf",
  cis: "cis-controls",
  soc2: "soc2-mapping",
};

export function registerReportingTools(server: McpServer): void {
  server.tool(
    "get-report-template",
    "Get a report template: 'audit' (technical), 'executive' (leadership summary), 'vulnerability' (individual finding).",
    {
      template: z.enum(["audit", "executive", "vulnerability"]).describe("Template type"),
    },
    async ({ template }) => {
      const file = TEMPLATE_MAP[template];
      const content = readDataFile("templates", `${file}.md`);
      return { content: [{ type: "text" as const, text: content }] };
    }
  );

  server.tool(
    "map-compliance",
    "Map findings to a compliance framework (owasp, nist, cis, soc2).",
    {
      framework: z.enum(["owasp", "nist", "cis", "soc2"]).describe("Compliance framework"),
      finding_layer: z.string().optional().describe("Audit layer to filter for"),
    },
    async ({ framework, finding_layer }) => {
      const file = COMPLIANCE_MAP[framework];
      let content = readDataFile("compliance-mappings", `${file}.md`);
      if (finding_layer) {
        content = `> **Filtered for layer: ${finding_layer}**\n\n` + content;
      }
      return { content: [{ type: "text" as const, text: content }] };
    }
  );
}
