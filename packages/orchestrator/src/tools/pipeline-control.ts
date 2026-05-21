import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PipelinePhase, PHASE_LABELS } from "@steve/core";

/**
 * Pipeline control tools — allow the agent to understand and
 * report on the audit pipeline state.
 */
export function registerPipelineTools(server: McpServer): void {
  server.tool(
    "get-pipeline-overview",
    "Get the full Steve audit pipeline overview: all 9 phases, their purpose, and execution order. Use this at the start of any audit to understand the full process.",
    {},
    async () => {
      const phases = [
        {
          phase: 0,
          name: "Business Discovery",
          description: "Auto-infer and clarify what the target project does, its industry, data sensitivity, compliance needs, and critical functions. This context drives all subsequent analysis.",
          tools: ["infer-business-context", "get-clarifying-questions"],
        },
        {
          phase: 1,
          name: "System Discovery",
          description: "Map the complete system: tech stack, dependencies, infrastructure, deployment, entry points, data stores.",
          tools: ["get-methodology (phase 1)"],
        },
        {
          phase: 2,
          name: "Architecture Mapping",
          description: "Identify architecture at 6 levels (system, service, component, code, infrastructure, data). Generate diagrams. Analyze each architectural decision for security implications with recommendations and alternatives.",
          tools: ["generate-architecture-diagram", "analyze-architecture"],
        },
        {
          phase: 3,
          name: "Threat Modeling",
          description: "Apply STRIDE threat modeling per component. Map attack surfaces. Identify threat actors and trust boundary violations.",
          tools: ["get-threat-model", "list-threat-models", "get-methodology (phase 2-3)"],
        },
        {
          phase: 4,
          name: "Layered Security Audit",
          description: "Systematic 12-layer security audit using checklists. Cross-reference code against attack patterns. Weight findings by business context.",
          tools: ["list-checklists", "get-checklist", "match-vulnerabilities", "list-attack-patterns", "get-attack-pattern"],
        },
        {
          phase: 5,
          name: "License Compliance",
          description: "Scan all dependency manifests for license conflicts, copyleft contamination, and policy violations. Recommend alternatives for problematic dependencies.",
          tools: ["analyze-licenses", "get-license-policy"],
        },
        {
          phase: 6,
          name: "AI Opportunity Analysis",
          description: "Identify where AI/ML can improve the target system — both security-specific (anomaly detection, threat detection) and general (features, automation, analytics). Assess risks for each.",
          tools: ["analyze-ai-opportunities"],
        },
        {
          phase: 7,
          name: "Risk & Remediation",
          description: "Score all findings using the risk formula. Create prioritized remediation plan with SLAs (P0=48hrs to P4=opportunistic). Get fix guidance with code examples.",
          tools: ["calculate-risk-score", "get-remediation", "map-compliance"],
        },
        {
          phase: 8,
          name: "Report Generation",
          description: "Generate structured markdown reports and data for the web dashboard. Produce: business context summary, architecture analysis with diagrams, security findings, license compliance, AI opportunities, remediation plan, and executive summary. IMPORTANT: Call save-report at the end to persist results to the dashboard.",
          tools: ["get-report-template", "save-report"],
        },
      ];

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agent: "Steve — End-to-End Security Agent",
            version: "2.0.0",
            total_phases: 9,
            total_tools: 19,
            pipeline: phases,
            execution_note: "Phases run sequentially. Each phase's output feeds into the next. Start with Phase 0 (Business Discovery) for every audit.",
          }, null, 2),
        }],
      };
    }
  );
}
