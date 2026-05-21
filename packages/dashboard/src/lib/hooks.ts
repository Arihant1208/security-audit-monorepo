import useSWR from "swr";
import { fetcher } from "./api";
import type { ReportSummary, ReportDetail, ApiKey, UsageData, Team } from "./types";

// Re-export types and mutations for backward compatibility
export type { ReportSummary, ReportDetail, ApiKey, UsageData, TeamMember, Team } from "./types";
export type { Severity, ReportStatus, TeamRole } from "./types";
export {
  createApiKey,
  revokeApiKey,
  createTeam,
  inviteTeamMember,
  removeTeamMember,
  changeTeamRole,
  uploadReport,
} from "./mutations";

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
