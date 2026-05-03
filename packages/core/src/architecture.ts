// ─────────────────────────────────────────────────────────────────────────────
// Steve Core — Architecture Types
// ─────────────────────────────────────────────────────────────────────────────

/** Architecture patterns Steve can identify */
export type ArchitecturePattern =
  | "monolith"
  | "microservices"
  | "serverless"
  | "event-driven"
  | "modular-monolith"
  | "hybrid";

/** Taxonomy of components Steve maps */
export type ComponentType =
  | "web-server"
  | "api-gateway"
  | "service"
  | "database"
  | "cache"
  | "queue"
  | "storage"
  | "cdn"
  | "load-balancer"
  | "auth-provider"
  | "external-api"
  | "worker"
  | "scheduler"
  | "frontend"
  | "mobile-app";

export interface TechStackEntry {
  name: string;
  version?: string;
  category: "language" | "framework" | "database" | "infrastructure" | "tool" | "library";
}

export interface SystemComponent {
  id: string;
  name: string;
  type: ComponentType;
  technology: TechStackEntry[];
  description: string;
  /** Files/directories in source that implement this component */
  sourceLocations: string[];
  exposedPorts?: number[];
  dataStored?: string[];
}

export interface ComponentConnection {
  from: string;   // component id
  to: string;     // component id
  protocol: string;
  encrypted: boolean;
  description: string;
  dataFlows: string[];
}

export interface TrustBoundary {
  id: string;
  name: string;
  level: "public" | "dmz" | "internal" | "restricted";
  components: string[];   // component ids
}

export interface SystemArchitecture {
  pattern: ArchitecturePattern;
  components: SystemComponent[];
  connections: ComponentConnection[];
  trustBoundaries: TrustBoundary[];
  techStack: TechStackEntry[];
  entryPoints: EntryPoint[];
}

export interface EntryPoint {
  type: "http" | "grpc" | "websocket" | "cli" | "queue" | "cron" | "webhook";
  path?: string;
  method?: string;
  authRequired: boolean;
  description: string;
  component: string;    // component id
}

// ── Architecture Diagrams ───────────────────────────────────────────────────

export type DiagramType =
  | "system-context"     // C4 Level 1
  | "container"          // C4 Level 2
  | "component"          // C4 Level 3
  | "data-flow"          // DFD with trust boundaries
  | "deployment"         // Infrastructure topology
  | "threat-surface";    // Attack vectors overlaid

export type DiagramFormat = "mermaid" | "d2";

export interface ArchitectureDiagram {
  type: DiagramType;
  format: DiagramFormat;
  title: string;
  source: string;          // Mermaid or D2 source code
  description: string;
}

// ── Architecture Recommendations ────────────────────────────────────────────

export type RecommendationPriority = "critical" | "high" | "medium" | "low" | "info";

export interface ArchitectureRecommendation {
  id: string;
  component: string;
  finding: string;
  securityImplication: string;
  recommendation: string;
  alternatives: Alternative[];
  priority: RecommendationPriority;
}

export interface Alternative {
  approach: string;
  pros: string[];
  cons: string[];
  effort: "low" | "medium" | "high";
}
