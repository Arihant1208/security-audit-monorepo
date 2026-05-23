import { describe, it, expect } from "vitest";
import { PipelinePhase, PHASE_LABELS } from "../src/pipeline.js";

describe("PipelinePhase", () => {
  it("should have 9 phases (0-8)", () => {
    expect(PipelinePhase.BusinessDiscovery).toBe(0);
    expect(PipelinePhase.ReportGeneration).toBe(8);
  });

  it("should have labels for all phases", () => {
    const phases = Object.values(PipelinePhase).filter((v) => typeof v === "number") as number[];
    expect(phases).toHaveLength(9);

    for (const phase of phases) {
      expect(PHASE_LABELS[phase as PipelinePhase]).toBeDefined();
      expect(typeof PHASE_LABELS[phase as PipelinePhase]).toBe("string");
    }
  });

  it("should have meaningful label names", () => {
    expect(PHASE_LABELS[PipelinePhase.BusinessDiscovery]).toBe("Business Discovery");
    expect(PHASE_LABELS[PipelinePhase.ThreatModeling]).toBe("Threat Modeling");
    expect(PHASE_LABELS[PipelinePhase.ReportGeneration]).toBe("Report Generation");
  });
});
