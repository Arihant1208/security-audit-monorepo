// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — Security Findings & Risk Scoring Types
// ─────────────────────────────────────────────────────────────────────────────

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "informational";
export type RemediationPriority = "P0" | "P1" | "P2" | "P3" | "P4";

/** The 12 security audit layers */
export type AuditLayer =
  | "architecture"
  | "identity-access"
  | "application-security"
  | "api-security"
  | "data-security"
  | "network-security"
  | "infrastructure-cloud"
  | "devops-cicd"
  | "supply-chain"
  | "client-side"
  | "monitoring-logging"
  | "business-logic";

export interface RiskScore {
  impact: number;            // 1.0–4.0
  exploitability: number;    // 0.5–2.0
  exposure: number;          // 0.5–1.5
  businessContext: number;   // -1.0–+2.0
  rawScore: number;
  finalScore: number;        // 0–10
  level: SeverityLevel;
  priority: RemediationPriority;
  sla: string;
}

export interface SecurityFinding {
  id: string;                      // e.g., "V-001"
  title: string;
  layer: AuditLayer;
  severity: SeverityLevel;
  riskScore: RiskScore;
  component: string;               // which system component is affected
  location?: string;               // file:line or config path
  description: string;
  evidence: string;                // code snippet or config excerpt
  impact: string;
  recommendation: string;
  references: string[];            // CWE, OWASP, etc.
  complianceMappings: string[];    // e.g., "OWASP A01", "NIST PR.AC"
}

export interface ChecklistResult {
  layer: AuditLayer;
  totalItems: number;
  passed: number;
  failed: number;
  notApplicable: number;
  partial: number;
  findings: SecurityFinding[];
}

export interface RemediationStep {
  findingId: string;
  title: string;
  priority: RemediationPriority;
  effort: "low" | "medium" | "high";
  description: string;
  codeExample?: string;
  language?: string;
}

export interface RemediationPlan {
  immediate: RemediationStep[];    // P0 — 24-48h
  shortTerm: RemediationStep[];    // P1 — 1-2 weeks
  mediumTerm: RemediationStep[];   // P2 — 1-3 months
  longTerm: RemediationStep[];     // P3/P4 — next cycle
}
