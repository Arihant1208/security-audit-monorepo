// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — Pipeline State (the accumulator that flows through all phases)
// ─────────────────────────────────────────────────────────────────────────────

import type { PipelinePhase, PhaseResult } from "./pipeline.js";
import type { BusinessContext } from "./business.js";
import type {
  SystemArchitecture,
  ArchitectureDiagram,
  ArchitectureRecommendation,
} from "./architecture.js";
import type {
  SecurityFinding,
  ChecklistResult,
  RemediationPlan,
} from "./security.js";
import type { LicenseAuditResult } from "./license.js";
import type { AIAnalysisResult } from "./ai-opportunities.js";

export interface PipelineConfig {
  /** Absolute path to the target project being audited */
  targetDir: string;
  /** Phases to run (default: all) */
  phases?: PipelinePhase[];
  /** URL for the Python AI engine */
  aiEngineUrl?: string;
  /** Whether to generate the web dashboard output */
  generateDashboard?: boolean;
  /** Output directory for reports (default: audit-results/) */
  outputDir?: string;
}

export interface PipelineState {
  config: PipelineConfig;
  currentPhase: PipelinePhase;
  startedAt: string;
  completedAt?: string;

  /** Phase 0 output */
  businessContext?: BusinessContext;

  /** Phase 1 output — raw discovery data */
  systemDiscovery?: {
    fileTree: string[];
    configFiles: Record<string, string>;
    techStack: string[];
    entryPoints: string[];
  };

  /** Phase 2 output */
  architecture?: SystemArchitecture;
  diagrams?: ArchitectureDiagram[];
  architectureRecommendations?: ArchitectureRecommendation[];

  /** Phase 3 output */
  threatModel?: {
    threats: ThreatEntry[];
    attackSurface: AttackSurfaceEntry[];
  };

  /** Phase 4 output */
  auditResults?: ChecklistResult[];
  findings?: SecurityFinding[];

  /** Phase 5 output */
  licenseAudit?: LicenseAuditResult;

  /** Phase 6 output */
  aiAnalysis?: AIAnalysisResult;

  /** Phase 7 output */
  remediationPlan?: RemediationPlan;

  /** Phase 8 output — paths to generated reports */
  reports?: Record<string, string>;

  /** All phase results for tracking */
  phaseResults: PhaseResult[];
}

// ── Threat Modeling sub-types ───────────────────────────────────────────────

export type StrideCategory =
  | "spoofing"
  | "tampering"
  | "repudiation"
  | "information-disclosure"
  | "denial-of-service"
  | "elevation-of-privilege";

export interface ThreatEntry {
  id: string;
  category: StrideCategory;
  component: string;
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  existingControls: string[];
  gaps: string[];
}

export interface AttackSurfaceEntry {
  id: string;
  type: string;
  description: string;
  exposureLevel: number;    // 0–10
  components: string[];
}
