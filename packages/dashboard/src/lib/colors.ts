import type { Severity, ReportStatus } from "./types";

// ─── Severity Colors ─────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "text-red-500",
  high: "text-orange-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
  info: "text-gray-400",
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  info: "bg-gray-400",
};

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  info: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function severityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info;
}

export function severityBg(severity: Severity): string {
  return SEVERITY_BG[severity] ?? SEVERITY_BG.info;
}

export function severityBadgeClass(severity: Severity): string {
  return SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.info;
}

// ─── Risk Score Colors ───────────────────────────────────────────────────────

export function riskScoreColor(score: number): string {
  if (score >= 8) return "text-red-500";
  if (score >= 6) return "text-orange-500";
  if (score >= 4) return "text-amber-500";
  return "text-emerald-500";
}

export function riskScoreBg(score: number): string {
  if (score >= 8) return "bg-red-500";
  if (score >= 6) return "bg-orange-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-emerald-500";
}

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReportStatus, { label: string; class: string }> = {
  completed: { label: "Completed", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  running: { label: "Running", class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  failed: { label: "Failed", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export function statusConfig(status: ReportStatus) {
  return STATUS_CONFIG[status] ?? { label: status, class: "bg-gray-100 text-gray-700" };
}
