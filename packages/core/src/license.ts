// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — License Compliance Types
// ─────────────────────────────────────────────────────────────────────────────

/** SPDX license identifiers commonly encountered */
export type LicenseCategory =
  | "permissive"        // MIT, BSD, Apache-2.0, ISC
  | "weak-copyleft"     // LGPL, MPL, EPL
  | "strong-copyleft"   // GPL-2.0, GPL-3.0, AGPL-3.0
  | "proprietary"       // Commercial, EULA
  | "public-domain"     // Unlicense, CC0
  | "unknown";          // No license detected

export type LicenseRisk = "none" | "low" | "medium" | "high" | "critical";

export interface DependencyLicense {
  name: string;
  version: string;
  license: string;         // SPDX identifier
  licenseCategory: LicenseCategory;
  risk: LicenseRisk;
  source: string;          // which manifest file (package.json, Cargo.toml, etc.)
  isDirect: boolean;       // direct vs transitive
  repository?: string;
}

export interface LicenseConflict {
  dependency: string;
  dependencyLicense: string;
  projectLicense: string;
  conflict: string;           // explanation of the conflict
  risk: LicenseRisk;
  recommendation: string;
  alternatives: LicenseAlternative[];
}

export interface LicenseAlternative {
  package: string;
  license: string;
  description: string;
  migrationEffort: "low" | "medium" | "high";
}

export interface LicensePolicyRule {
  id: string;
  description: string;
  /** License categories that violate this rule */
  blocked: LicenseCategory[];
  /** Specific SPDX IDs that violate this rule */
  blockedLicenses: string[];
  severity: LicenseRisk;
}

export interface LicenseAuditResult {
  projectLicense: string;
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  dependencies: DependencyLicense[];
  conflicts: LicenseConflict[];
  policyViolations: LicensePolicyViolation[];
  summary: LicenseSummary;
}

export interface LicensePolicyViolation {
  rule: LicensePolicyRule;
  dependency: DependencyLicense;
  recommendation: string;
}

export interface LicenseSummary {
  /** Count of dependencies by license category */
  byCategory: Record<LicenseCategory, number>;
  /** Count of dependencies by risk level */
  byRisk: Record<LicenseRisk, number>;
  /** Overall compliance status */
  compliant: boolean;
  /** Top issues requiring attention */
  topIssues: string[];
}
