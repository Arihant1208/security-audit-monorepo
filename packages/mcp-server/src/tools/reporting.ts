import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile } from "../data.js";

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
    "Get a report template for generating audit deliverables. Available templates: 'audit' (full technical report), 'executive' (leadership summary), 'vulnerability' (individual finding report).",
    {
      template: z
        .enum(["audit", "executive", "vulnerability"])
        .describe("Template type: 'audit', 'executive', or 'vulnerability'"),
    },
    async ({ template }) => {
      const file = TEMPLATE_MAP[template];
      const content = readDataFile("templates", `${file}.md`);
      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );

  server.tool(
    "map-compliance",
    "Map audit findings to a compliance framework. Returns the relevant compliance controls and how they relate to audit checklist items. Supported frameworks: owasp, nist, cis, soc2.",
    {
      framework: z
        .enum(["owasp", "nist", "cis", "soc2"])
        .describe("Compliance framework: 'owasp' (OWASP Top 10), 'nist' (NIST CSF), 'cis' (CIS Controls v8), 'soc2' (SOC 2)"),
      finding_layer: z
        .string()
        .optional()
        .describe(
          "Optional: specific audit layer to filter mappings for (e.g. 'application-security', 'identity-access')"
        ),
    },
    async ({ framework, finding_layer }) => {
      const file = COMPLIANCE_MAP[framework];
      let content = readDataFile("compliance-mappings", `${file}.md`);

      if (finding_layer) {
        content =
          `> **Filtered for layer: ${finding_layer}** — Review the mappings below for relevance to this audit layer.\n\n` +
          content;
      }

      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );
}
