/**
 * Pipeline job worker — polls for queued jobs and executes them.
 *
 * Can run in the same process as the HTTP server (started via startWorker())
 * or as a standalone process for horizontal scaling.
 *
 * Uses PG advisory locks + FOR UPDATE SKIP LOCKED for safe concurrency.
 */

import { PipelinePhase } from "@steve/core";
import { StevePipeline, createInitialState } from "./index.js";
import {
  claimNextJob,
  updateJobProgress,
  completeJob,
  failJob,
  type JobRecord,
} from "./queue.js";

const POLL_INTERVAL_MS = 5_000; // Poll every 5 seconds
const MAX_CONCURRENT = 2; // Max concurrent jobs per worker

let activeJobs = 0;
let running = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background worker loop.
 * Call this from the main server startup.
 */
export function startWorker(): void {
  if (running) return;
  running = true;

  console.error(`[worker] Started (poll=${POLL_INTERVAL_MS}ms, maxConcurrent=${MAX_CONCURRENT})`);

  pollTimer = setInterval(async () => {
    if (activeJobs >= MAX_CONCURRENT) return;

    try {
      const job = await claimNextJob();
      if (job) {
        activeJobs++;
        processJob(job).finally(() => {
          activeJobs--;
        });
      }
    } catch (err) {
      console.error("[worker] Poll error:", err);
    }
  }, POLL_INTERVAL_MS);
  pollTimer.unref(); // Don't prevent process exit
}

/**
 * Stop the worker loop gracefully.
 */
export function stopWorker(): void {
  running = false;
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  console.error(`[worker] Stopped (${activeJobs} jobs still active)`);
}

/**
 * Process a single pipeline job.
 */
async function processJob(job: JobRecord): Promise<void> {
  console.error(`[worker] Processing job ${job.id}: ${job.project_name}`);

  const progress: JobRecord["progress"] = job.phases.map((p) => ({
    phase: p,
    status: "pending",
  }));

  try {
    const pipeline = new StevePipeline({
      onPhaseStart: (phase) => {
        const idx = progress.findIndex((p) => p.phase === phase);
        if (idx !== -1) {
          progress[idx] = { ...progress[idx], status: "running", startedAt: new Date().toISOString() };
        }
        updateJobProgress(job.id, phase, progress).catch(() => {});
      },
      onPhaseComplete: (phase) => {
        const idx = progress.findIndex((p) => p.phase === phase);
        if (idx !== -1) {
          progress[idx] = { ...progress[idx], status: "completed", completedAt: new Date().toISOString() };
        }
        updateJobProgress(job.id, phase, progress).catch(() => {});
      },
      onPhaseFail: (phase, error) => {
        const idx = progress.findIndex((p) => p.phase === phase);
        if (idx !== -1) {
          progress[idx] = { ...progress[idx], status: "failed", error: error.message };
        }
        updateJobProgress(job.id, phase, progress).catch(() => {});
      },
    });

    // Run the pipeline (phases without handlers will be skipped)
    const config = {
      ...job.config,
      target: job.target,
      projectName: job.project_name,
      phases: job.phases.map((p) => p as PipelinePhase),
    };

    await pipeline.run(config);
    await completeJob(job.id);
    console.error(`[worker] Job ${job.id} completed`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await failJob(job.id, message);
    console.error(`[worker] Job ${job.id} failed:`, message);
  }
}
