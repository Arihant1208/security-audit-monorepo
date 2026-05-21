import useSWR from "swr";
import { fetcher, apiFetch } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReportSummary {
  id: string;
  project_name: string;
  status: "running" | "completed" | "failed";
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
    severity: "critical" | "high" | "medium" | "low" | "info";
    category: string;
    description: string;
    recommendation?: string;
    affected_component?: string;
  }> | null;
  pipeline_state: Record<string, unknown> | null;
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
  role: "admin" | "member" | "viewer";
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  members: TeamMember[];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useReports() {
  return useSWR<{ reports: ReportSummary[] }>("/api/reports", fetcher, {
    refreshInterval: 30_000,
  });
}

export function useReport(id: string) {
  return useSWR<{ report: ReportDetail }>(id ? `/api/reports/${id}` : null, fetcher);
}

export function useKeys() {
  return useSWR<{ keys: ApiKey[] }>("/api/keys", fetcher);
}

export function useUsage() {
  return useSWR<UsageData>("/api/usage", fetcher);
}

export function useTeam() {
  return useSWR<{ team: Team | null }>("/api/team", fetcher);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createApiKey(name: string) {
  return apiFetch<{ key: ApiKey & { raw_key: string } }>("/api/keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function revokeApiKey(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/keys/${id}`, { method: "DELETE" });
}

export async function createTeam(name: string) {
  return apiFetch<{ team: Team }>("/api/teams", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function inviteTeamMember(teamId: string, email: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/${teamId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function changeTeamRole(teamId: string, userId: string, role: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/${teamId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function uploadReport(data: {
  project_name: string;
  status?: string;
  risk_score?: number;
  summary?: Record<string, number>;
  findings?: unknown[];
  business_context?: Record<string, unknown>;
  pipeline_state?: Record<string, unknown>;
}) {
  return apiFetch<{ report: ReportSummary }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
