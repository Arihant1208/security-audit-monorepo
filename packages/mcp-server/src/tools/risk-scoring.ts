import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRiskScoringTools(server: McpServer): void {
  server.tool(
    "calculate-risk-score",
    "Calculate a risk score for a vulnerability using the framework's scoring model: Risk = min(10, Impact × Exploitability × Exposure + Business Context). Returns the numeric score, risk level, and recommended remediation SLA.",
    {
      impact: z
        .number()
        .min(1)
        .max(4)
        .describe(
          "Impact score (1.0=Low, 2.0=Medium, 3.0=High, 4.0=Critical). " +
            "Consider: data exposure, data modification, service disruption, blast radius."
        ),
      exploitability: z
        .number()
        .min(0.5)
        .max(2)
        .describe(
          "Exploitability score (0.5=Very Difficult, 1.0=Difficult, 1.5=Moderate, 2.0=Easy). " +
            "Consider: auth required, attack complexity, public exploit availability."
        ),
      exposure: z
        .number()
        .min(0.5)
        .max(1.5)
        .describe(
          "Exposure score (0.5=Internal only, 0.75=VPN/restricted, 1.0=Authenticated public, " +
            "1.25=Partially public, 1.5=Fully public internet)."
        ),
      business_context: z
        .number()
        .min(-1)
        .max(2)
        .describe(
          "Business context modifier (-1.0 to +2.0). " +
            "+2.0=Regulated data (PCI/HIPAA/GDPR), +1.5=Revenue-critical, " +
            "+1.0=Customer-facing, +0.5=Internal, 0=None, " +
            "-0.5=Compensating controls, -1.0=Decommissioning."
        ),
      vulnerability_title: z
        .string()
        .optional()
        .describe("Title of the vulnerability being scored, for the response context"),
    },
    async ({ impact, exploitability, exposure, business_context, vulnerability_title }) => {
      const rawScore = impact * exploitability * exposure;
      const finalScore = Math.min(10, Math.max(0, rawScore + business_context));
      const rounded = Math.round(finalScore * 10) / 10;

      let level: string;
      let sla: string;
      let priority: string;

      if (rounded >= 9.0) {
        level = "Critical";
        sla = "Remediate within 24-48 hours";
        priority = "P0";
      } else if (rounded >= 7.0) {
        level = "High";
        sla = "Remediate within 1-2 weeks";
        priority = "P1";
      } else if (rounded >= 4.0) {
        level = "Medium";
        sla = "Remediate within 1-3 months";
        priority = "P2";
      } else if (rounded >= 2.0) {
        level = "Low";
        sla = "Remediate in next development cycle";
        priority = "P3";
      } else {
        level = "Informational";
        sla = "Address opportunistically";
        priority = "P4";
      }

      const result = {
        vulnerability: vulnerability_title ?? "Unnamed",
        scoring: {
          impact,
          exploitability,
          exposure,
          business_context,
          raw_score: Math.round(rawScore * 10) / 10,
          final_score: rounded,
        },
        risk_level: level,
        priority,
        remediation_sla: sla,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
