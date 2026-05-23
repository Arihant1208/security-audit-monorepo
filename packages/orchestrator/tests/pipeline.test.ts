import { describe, it, expect, vi } from "vitest";
import { StevePipeline, createInitialState, getPipelineSummary } from "../src/pipeline/index.js";
import { PipelinePhase } from "@steve/core";

describe("StevePipeline", () => {
  it("should create initial state with all phases pending", () => {
    const state = createInitialState({ target: "./test-project", projectName: "test" });

    expect(state.currentPhase).toBe(PipelinePhase.BusinessDiscovery);
    expect(state.phaseResults).toHaveLength(9);
    expect(state.phaseResults.every((r) => r.status === "pending")).toBe(true);
    expect(state.startedAt).toBeDefined();
  });

  it("should run all registered phases in order", async () => {
    const executionOrder: number[] = [];

    const pipeline = new StevePipeline();
    pipeline.registerPhase(PipelinePhase.BusinessDiscovery, async (state) => {
      executionOrder.push(0);
      return { ...state, businessContext: { industry: "tech" } };
    });
    pipeline.registerPhase(PipelinePhase.SystemDiscovery, async (state) => {
      executionOrder.push(1);
      return state;
    });
    pipeline.registerPhase(PipelinePhase.ReportGeneration, async (state) => {
      executionOrder.push(8);
      return state;
    });

    const result = await pipeline.run({ target: "./test", projectName: "test" });

    expect(executionOrder).toEqual([0, 1, 8]);
    expect(result.completedAt).toBeDefined();
  });

  it("should skip phases without handlers", async () => {
    const pipeline = new StevePipeline();
    pipeline.registerPhase(PipelinePhase.BusinessDiscovery, async (state) => state);

    const result = await pipeline.run({ target: "./test", projectName: "test" });

    const businessPhase = result.phaseResults.find((r) => r.phase === PipelinePhase.BusinessDiscovery);
    const threatPhase = result.phaseResults.find((r) => r.phase === PipelinePhase.ThreatModeling);

    expect(businessPhase?.status).toBe("completed");
    expect(threatPhase?.status).toBe("skipped");
  });

  it("should continue after a phase fails", async () => {
    const pipeline = new StevePipeline();
    pipeline.registerPhase(PipelinePhase.BusinessDiscovery, async () => {
      throw new Error("Phase 0 exploded");
    });
    pipeline.registerPhase(PipelinePhase.SystemDiscovery, async (state) => state);

    const result = await pipeline.run({ target: "./test", projectName: "test" });

    const phase0 = result.phaseResults.find((r) => r.phase === PipelinePhase.BusinessDiscovery);
    const phase1 = result.phaseResults.find((r) => r.phase === PipelinePhase.SystemDiscovery);

    expect(phase0?.status).toBe("failed");
    expect(phase0?.error).toBe("Phase 0 exploded");
    expect(phase1?.status).toBe("completed");
  });

  it("should emit lifecycle events", async () => {
    const onPhaseStart = vi.fn();
    const onPhaseComplete = vi.fn();
    const onPipelineComplete = vi.fn();

    const pipeline = new StevePipeline({
      onPhaseStart,
      onPhaseComplete,
      onPipelineComplete,
    });
    pipeline.registerPhase(PipelinePhase.BusinessDiscovery, async (state) => state);

    await pipeline.run({ target: "./test", projectName: "test" });

    expect(onPhaseStart).toHaveBeenCalledWith(PipelinePhase.BusinessDiscovery, expect.any(Object));
    expect(onPhaseComplete).toHaveBeenCalledWith(PipelinePhase.BusinessDiscovery, expect.any(Object));
    expect(onPipelineComplete).toHaveBeenCalledOnce();
  });

  it("should run only specified phases when config.phases is set", async () => {
    const executed: number[] = [];
    const pipeline = new StevePipeline();

    pipeline.registerPhase(PipelinePhase.BusinessDiscovery, async (state) => {
      executed.push(0);
      return state;
    });
    pipeline.registerPhase(PipelinePhase.LayeredSecurityAudit, async (state) => {
      executed.push(4);
      return state;
    });
    pipeline.registerPhase(PipelinePhase.RiskAndRemediation, async (state) => {
      executed.push(7);
      return state;
    });

    const result = await pipeline.run({
      target: "./test",
      projectName: "test",
      phases: [PipelinePhase.BusinessDiscovery, PipelinePhase.LayeredSecurityAudit, PipelinePhase.RiskAndRemediation],
    });

    expect(executed).toEqual([0, 4, 7]);
  });

  it("should generate a readable pipeline summary", () => {
    const state = createInitialState({ target: "./test", projectName: "test" });
    state.phaseResults[0].status = "completed";
    state.phaseResults[1].status = "running";
    state.phaseResults[2].status = "failed";

    const summary = getPipelineSummary(state);

    expect(summary).toContain("Pipeline Status");
    expect(summary).toContain("✅");
    expect(summary).toContain("Business Discovery");
  });
});
