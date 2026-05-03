// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — AI/Agentic Opportunity Analysis Types
// ─────────────────────────────────────────────────────────────────────────────

export type AICategory =
  | "security-monitoring"
  | "anomaly-detection"
  | "threat-detection"
  | "automated-response"
  | "code-analysis"
  | "user-experience"
  | "data-processing"
  | "recommendation"
  | "automation"
  | "predictive";

export type ImplementationComplexity = "low" | "medium" | "high" | "very-high";

export interface AIOpportunity {
  id: string;
  title: string;
  category: AICategory;
  /** Which component this applies to */
  component: string;
  /** What the AI/ML enhancement would do */
  description: string;
  /** Expected benefits */
  benefits: string[];
  /** How to implement (high level) */
  implementationApproach: string;
  complexity: ImplementationComplexity;
  /** Estimated ROI: low / medium / high */
  estimatedImpact: "low" | "medium" | "high";
  /** Data privacy considerations */
  privacyImplications: string[];
  /** Security risks introduced by the AI itself */
  aiSecurityRisks: string[];
  /** Prerequisites needed before implementation */
  prerequisites: string[];
}

export interface AIRiskAssessment {
  opportunity: string;      // AIOpportunity id
  dataPrivacyRisk: "low" | "medium" | "high";
  modelSecurityRisk: "low" | "medium" | "high";
  ethicalConcerns: string[];
  costEstimate: "low" | "medium" | "high";
  recommendation: "proceed" | "proceed-with-caution" | "defer" | "avoid";
  rationale: string;
}

export interface AIAnalysisResult {
  /** Security-focused AI opportunities */
  securityOpportunities: AIOpportunity[];
  /** General system feature/process AI opportunities */
  generalOpportunities: AIOpportunity[];
  /** Risk assessment for each opportunity */
  riskAssessments: AIRiskAssessment[];
  /** Overall summary */
  summary: string;
}
