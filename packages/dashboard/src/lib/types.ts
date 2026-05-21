// ─── Shared Types ────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type ReportStatus = "running" | "completed" | "failed";
export type TeamRole = "admin" | "member" | "viewer";

export interface ReportSummary {
  id: string;
  project_name: string;
  status: ReportStatus;
  risk_score: number | null;
  summary: { critical: number; high: number; medium: number; low: number; info: number } | null;
  created_at: string;
  completed_at: string | null;
}

export interface ReportDetail extends ReportSummary {
  business_context: Record<string, unknown> | null;
  findings: Array<{
    id?: string;
    title: string;
    severity: Severity;
    category: string;
    description: string;
    recommendation?: string;
    affected_component?: string;
  }> | null;
  pipeline_state: Record<string, unknown> | null;
  phase_outputs: Record<string, string> | null;
  user_id: string;
}

export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface UsageData {
  total: { total: number; active_days: number };
  by_tool: Array<{ tool_name: string; calls: number; avg_ms: number }>;
  daily: Array<{ date: string; calls: number }>;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  role: TeamRole;
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  members: TeamMember[];
}
