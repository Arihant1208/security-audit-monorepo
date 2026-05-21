import { apiFetch } from "./api";
import type { ApiKey, ReportSummary, Team } from "./types";

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
  phase_outputs?: Record<string, string>;
}) {
  return apiFetch<{ report: ReportSummary }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
