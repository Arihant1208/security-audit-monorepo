/**
 * Steve Pipeline Engine — orchestrates the 9-phase autonomous security audit.
 *
 * Each phase is a discrete step that reads from PipelineState and writes
 * its results back. The engine runs phases sequentially, passing accumulated
 * state through the pipeline.
 */

import {
  PipelinePhase,
  PHASE_LABELS,
  type PipelineState,
  type PipelineConfig,
  type PhaseResult,
  type PhaseStatus,
} from "@steve/core";

export type PhaseHandler = (state: PipelineState) => Promise<PipelineState>;

export interface PipelineEvents {
  onPhaseStart?: (phase: PipelinePhase, state: PipelineState) => void;
  onPhaseComplete?: (phase: PipelinePhase, state: PipelineState) => void;
  onPhaseFail?: (phase: PipelinePhase, error: Error, state: PipelineState) => void;
  onPipelineComplete?: (state: PipelineState) => void;
}

/**
 * All phases in execution order.
 */
const ALL_PHASES: PipelinePhase[] = [
  PipelinePhase.BusinessDiscovery,
  PipelinePhase.SystemDiscovery,
  PipelinePhase.ArchitectureMapping,
  PipelinePhase.ThreatModeling,
  PipelinePhase.LayeredSecurityAudit,
  PipelinePhase.LicenseCompliance,
  PipelinePhase.AIOpportunityAnalysis,
  PipelinePhase.RiskAndRemediation,
  PipelinePhase.ReportGeneration,
];

export function createInitialState(config: PipelineConfig): PipelineState {
  return {
    config,
    currentPhase: PipelinePhase.BusinessDiscovery,
    startedAt: new Date().toISOString(),
    phaseResults: ALL_PHASES.map((phase) => ({
      phase,
      status: "pending" as PhaseStatus,
    })),
  };
}

export class StevePipeline {
  private handlers = new Map<PipelinePhase, PhaseHandler>();
  private events: PipelineEvents;

  constructor(events: PipelineEvents = {}) {
    this.events = events;
  }

  /** Register a handler for a pipeline phase */
  registerPhase(phase: PipelinePhase, handler: PhaseHandler): void {
    this.handlers.set(phase, handler);
  }

  /** Run the full pipeline */
  async run(config: PipelineConfig): Promise<PipelineState> {
    let state = createInitialState(config);
    const phasesToRun = config.phases ?? ALL_PHASES;

    for (const phase of phasesToRun) {
      state.currentPhase = phase;
      const handler = this.handlers.get(phase);

      if (!handler) {
        // Skip phases without handlers
        this.updatePhaseResult(state, phase, "skipped");
        continue;
      }

      this.events.onPhaseStart?.(phase, state);
      this.updatePhaseResult(state, phase, "running", { startedAt: new Date().toISOString() });

      try {
        state = await handler(state);
        this.updatePhaseResult(state, phase, "completed", { completedAt: new Date().toISOString() });
        this.events.onPhaseComplete?.(phase, state);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.updatePhaseResult(state, phase, "failed", { error: error.message });
        this.events.onPhaseFail?.(phase, error, state);
        // Continue to next phase — don't halt the pipeline
      }
    }

    state.completedAt = new Date().toISOString();
    this.events.onPipelineComplete?.(state);
    return state;
  }

  private updatePhaseResult(
    state: PipelineState,
    phase: PipelinePhase,
    status: PhaseStatus,
    extra: Partial<PhaseResult> = {}
  ): void {
    const idx = state.phaseResults.findIndex((r) => r.phase === phase);
    if (idx !== -1) {
      state.phaseResults[idx] = { ...state.phaseResults[idx], status, ...extra };
    }
  }
}

/** Get a human-readable pipeline progress summary */
export function getPipelineSummary(state: PipelineState): string {
  const lines = ["# Steve Pipeline Status", ""];
  for (const result of state.phaseResults) {
    const icon =
      result.status === "completed" ? "✅" :
      result.status === "running" ? "🔄" :
      result.status === "failed" ? "❌" :
      result.status === "skipped" ? "⏭️" : "⏳";
    lines.push(`${icon} Phase ${result.phase}: ${PHASE_LABELS[result.phase]} — ${result.status}`);
  }
  return lines.join("\n");
}
