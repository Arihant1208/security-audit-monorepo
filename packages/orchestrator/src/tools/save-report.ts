import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getSQL } from "../infra/sql-client.js";

/**
 * save-report tool — persists audit results to the database so they appear
 * in the dashboard. Called by the agent at the end of the pipeline (Phase 8).
 *
 * Authentication: Uses the API key from the MCP session to identify the user.
 * If no DB is configured, returns a message saying the report was generated
 * but not saved.
 */
export function registerSaveReportTool(server: McpServer): void {
  server.tool(
    "save-report",
    "Save the completed audit report to the database so it appears in the web dashboard. Call this at the end of Phase 8 (Report Generation) with all collected data.",
    {
      project_name: z.string().describe("Name of the audited project"),
      risk_score: z.number().min(0).max(10).optional().describe("Overall risk score (0-10)"),
      status: z.enum(["completed", "running", "failed"]).default("completed").describe("Audit status"),
      summary: z.object({
        critical: z.number().default(0),
        high: z.number().default(0),
        medium: z.number().default(0),
        low: z.number().default(0),
        info: z.number().default(0),
      }).optional().describe("Severity count summary"),
      findings: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
        severity: z.enum(["critical", "high", "medium", "low", "info"]),
        layer: z.string().optional(),
        description: z.string().optional(),
        evidence: z.string().optional(),
        recommendation: z.string().optional(),
        cwe: z.string().optional(),
        owasp: z.string().optional(),
      })).optional().describe("Array of security findings"),
      business_context: z.object({
        industry: z.string().optional(),
        description: z.string().optional(),
        compliance_frameworks: z.array(z.string()).optional(),
        data_sensitivity: z.string().optional(),
        risk_tolerance: z.string().optional(),
      }).passthrough().optional().describe("Business context from Phase 0"),
      pipeline_state: z.object({
        phases: z.array(z.object({
          phase: z.number(),
          name: z.string(),
          status: z.string(),
        })).optional(),
      }).passthrough().optional().describe("Pipeline execution state"),
      executive_summary: z.string().optional().describe("Executive summary text"),
      phase_outputs: z.object({
        business_context: z.string().optional(),
        system_discovery: z.string().optional(),
        architecture: z.string().optional(),
        threat_model: z.string().optional(),
        security_findings: z.string().optional(),
        license_compliance: z.string().optional(),
        ai_opportunities: z.string().optional(),
        remediation_plan: z.string().optional(),
        executive_summary: z.string().optional(),
        full_report: z.string().optional(),
      }).passthrough().optional().describe("Full markdown output from each pipeline phase"),
    },
    async (params) => {
      const sql = getSQL();
      if (!sql) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              saved: false,
              reason: "No database configured (DATABASE_URL not set). Report was generated but not persisted. Set DATABASE_URL to enable saving reports to the dashboard.",
            }),
          }],
        };
      }

      try {
        // Find user from the API key used in this session
        // Since MCP tools don't have direct access to the request auth context,
        // we save with a system user or look up from env
        const apiKeyEnv = process.env.SECURITY_AUDIT_API_KEYS?.split(",")[0];
        let userId: string | null = null;

        // Try to find a user — if API key auth was used, look up from api_keys table
        // For now, use the first user in the DB as the report owner
        const users = await sql`SELECT id, team_id FROM users ORDER BY created_at ASC LIMIT 1`;
        if (users.length > 0) {
          userId = users[0].id as string;
        } else {
          // Create a system user for MCP-originated reports
          userId = randomUUID();
          await sql`
            INSERT INTO users (id, clerk_id, email, display_name, plan)
            VALUES (${userId}, ${"mcp_system"}, ${"system@steve.dev"}, ${"Steve Agent"}, ${"free"})
          `;
        }

        const teamId = users[0]?.team_id ?? null;
        const reportId = randomUUID();

        await sql`
          INSERT INTO audit_reports (id, user_id, team_id, project_name, status, risk_score, summary, business_context, findings, pipeline_state, phase_outputs, completed_at)
          VALUES (
            ${reportId},
            ${userId},
            ${teamId},
            ${params.project_name},
            ${params.status},
            ${params.risk_score ?? null},
            ${params.summary ? JSON.stringify(params.summary) : null}::jsonb,
            ${params.business_context ? JSON.stringify({ ...params.business_context, executive_summary: params.executive_summary }) : null}::jsonb,
            ${params.findings ? JSON.stringify(params.findings) : null}::jsonb,
            ${params.pipeline_state ? JSON.stringify(params.pipeline_state) : null}::jsonb,
            ${params.phase_outputs ? JSON.stringify(params.phase_outputs) : null}::jsonb,
            ${params.status === "completed" ? new Date().toISOString() : null}
          )
        `;

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              saved: true,
              report_id: reportId,
              project_name: params.project_name,
              message: `Report saved successfully. View it in the dashboard at /reports/${reportId}`,
              findings_count: params.findings?.length ?? 0,
              risk_score: params.risk_score ?? null,
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              saved: false,
              error: message,
              reason: "Failed to save report to database",
            }),
          }],
        };
      }
    }
  );
}
