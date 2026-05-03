// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — Pipeline Phase Definitions
// ─────────────────────────────────────────────────────────────────────────────

export enum PipelinePhase {
  BusinessDiscovery = 0,
  SystemDiscovery = 1,
  ArchitectureMapping = 2,
  ThreatModeling = 3,
  LayeredSecurityAudit = 4,
  LicenseCompliance = 5,
  AIOpportunityAnalysis = 6,
  RiskAndRemediation = 7,
  ReportGeneration = 8,
}

export const PHASE_LABELS: Record<PipelinePhase, string> = {
  [PipelinePhase.BusinessDiscovery]: "Business Discovery",
  [PipelinePhase.SystemDiscovery]: "System Discovery",
  [PipelinePhase.ArchitectureMapping]: "Architecture Mapping",
  [PipelinePhase.ThreatModeling]: "Threat Modeling",
  [PipelinePhase.LayeredSecurityAudit]: "Layered Security Audit",
  [PipelinePhase.LicenseCompliance]: "License Compliance",
  [PipelinePhase.AIOpportunityAnalysis]: "AI Opportunity Analysis",
  [PipelinePhase.RiskAndRemediation]: "Risk & Remediation",
  [PipelinePhase.ReportGeneration]: "Report Generation",
};

export type PhaseStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface PhaseResult<T = unknown> {
  phase: PipelinePhase;
  status: PhaseStatus;
  startedAt?: string;
  completedAt?: string;
  data?: T;
  error?: string;
}
