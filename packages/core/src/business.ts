// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — Business Context Types
// ─────────────────────────────────────────────────────────────────────────────

/** Industry verticals that affect compliance requirements */
export type Industry =
  | "healthcare"
  | "finance"
  | "education"
  | "government"
  | "ecommerce"
  | "saas"
  | "media"
  | "gaming"
  | "iot"
  | "infrastructure"
  | "other";

/** Data sensitivity classifications */
export type DataSensitivity = "public" | "internal" | "confidential" | "restricted";

/** Risk tolerance profiles */
export type RiskTolerance = "aggressive" | "moderate" | "conservative" | "regulated";

/** Compliance frameworks potentially applicable */
export type ComplianceFramework =
  | "hipaa"
  | "pci-dss"
  | "gdpr"
  | "soc2"
  | "iso27001"
  | "fedramp"
  | "ccpa"
  | "nist-csf"
  | "cis";

export interface BusinessContext {
  /** What the project/product does (1–2 sentences) */
  description: string;

  /** Primary industry vertical */
  industry: Industry;

  /** Who uses the system */
  userTypes: string[];

  /** Revenue model (freemium, enterprise, marketplace, etc.) */
  revenueModel?: string;

  /** Types of data the system handles */
  dataTypes: string[];

  /** Overall data sensitivity level */
  dataSensitivity: DataSensitivity;

  /** Applicable compliance frameworks */
  complianceRequirements: ComplianceFramework[];

  /** Organizational risk tolerance */
  riskTolerance: RiskTolerance;

  /** Scale: approximate number of users/requests */
  scale?: string;

  /** Critical business functions that must not go down */
  criticalFunctions: string[];

  /** Confidence score for each auto-inferred field (0–1) */
  confidence: Record<string, number>;
}

/**
 * A clarifying question Steve asks the user to fill in gaps
 * after auto-inference.
 */
export interface ClarifyingQuestion {
  id: string;
  question: string;
  context: string;
  options?: string[];
  field: keyof BusinessContext;
}
