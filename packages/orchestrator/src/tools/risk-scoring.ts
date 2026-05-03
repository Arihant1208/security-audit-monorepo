import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRiskScoringTools(server: McpServer): void {
  server.tool(
    "calculate-risk-score",
    "Calculate a risk score: Risk = min(10, Impact × Exploitability × Exposure + Business Context). Returns score, risk level, priority, and SLA.",
    {
      impact: z.number().min(1).max(4).describe("Impact (1.0=Low → 4.0=Critical)"),
      exploitability: z.number().min(0.5).max(2).describe("Exploitability (0.5=Very Difficult → 2.0=Easy)"),
      exposure: z.number().min(0.5).max(1.5).describe("Exposure (0.5=Internal → 1.5=Fully Public)"),
      business_context: z.number().min(-1).max(2).describe("Business context modifier (-1.0 → +2.0)"),
      vulnerability_title: z.string().optional().describe("Title of the vulnerability being scored"),
    },
    async ({ impact, exploitability, exposure, business_context, vulnerability_title }) => {
      const rawScore = impact * exploitability * exposure;
      const finalScore = Math.min(10, Math.max(0, rawScore + business_context));
      const rounded = Math.round(finalScore * 10) / 10;

      let level: string, sla: string, priority: string;
      if (rounded >= 9.0) { level = "Critical"; sla = "Remediate within 24-48 hours"; priority = "P0"; }
      else if (rounded >= 7.0) { level = "High"; sla = "Remediate within 1-2 weeks"; priority = "P1"; }
      else if (rounded >= 4.0) { level = "Medium"; sla = "Remediate within 1-3 months"; priority = "P2"; }
      else if (rounded >= 2.0) { level = "Low"; sla = "Remediate in next development cycle"; priority = "P3"; }
      else { level = "Informational"; sla = "Address opportunistically"; priority = "P4"; }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            vulnerability: vulnerability_title ?? "Unnamed",
            scoring: { impact, exploitability, exposure, business_context, raw_score: Math.round(rawScore * 10) / 10, final_score: rounded },
            risk_level: level,
            priority,
            remediation_sla: sla,
          }, null, 2),
        }],
      };
    }
  );
}
