/**
 * PG-backed async job queue for pipeline execution.
 *
 * Uses SELECT ... FOR UPDATE SKIP LOCKED for reliable job claiming.
 * No external dependencies (Redis, BullMQ) — just PostgreSQL.
 */

import { randomUUID } from "node:crypto";
import { getSQL } from "../infra/sql-client.js";
import { StevePipeline, createInitialState, getPipelineSummary } from "./index.js";
import type { PipelineConfig, PipelineState } from "@steve/core";

export interface JobRecord {
  id: string;
  user_id: string | null;
  project_name: string;
  target: string;
  config: PipelineConfig;
  phases: number[];
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  current_phase: number | null;
  progress: Array<{ phase: number; status: string; startedAt?: string; completedAt?: string; error?: string }>;
  report_id: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

const WORKER_ID = `worker-${randomUUID().slice(0, 8)}`;
const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes — max pipeline duration before considered stale

/**
 * Enqueue a new pipeline job for async processing.
 */
export async function enqueueJob(params: {
  userId?: string;
  teamId?: string;
  projectName: string;
  target: string;
  config?: Partial<PipelineConfig>;
  phases?: number[];
}): Promise<string> {
  const sql = getSQL();
  if (!sql) throw new Error("Database not configured");

  const id = randomUUID();
  const config = params.config ?? {};
  const phases = params.phases ?? [0, 1, 2, 3, 4, 5, 6, 7, 8];

  await sql`
    INSERT INTO pipeline_jobs (id, user_id, team_id, project_name, target, config, phases)
    VALUES (
      ${id},
      ${params.userId ?? null},
      ${params.teamId ?? null},
      ${params.projectName},
      ${params.target},
      ${JSON.stringify(config)},
      ${phases}
    )
  `;

  return id;
}

/**
 * Claim the next available job using FOR UPDATE SKIP LOCKED.
 * Returns null if no jobs are available.
 */
export async function claimNextJob(): Promise<JobRecord | null> {
  const sql = getSQL();
  if (!sql) return null;

  // Also reclaim stale jobs (locked too long)
  const staleThreshold = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
  await sql`
    UPDATE pipeline_jobs
    SET status = 'queued', locked_by = NULL, locked_at = NULL
    WHERE status = 'running'
      AND locked_at < ${staleThreshold}
  `;

  const rows = await sql`
    UPDATE pipeline_jobs
    SET status = 'running',
        locked_by = ${WORKER_ID},
        locked_at = now(),
        started_at = COALESCE(started_at, now())
    WHERE id = (
      SELECT id FROM pipeline_jobs
      WHERE status = 'queued'
      ORDER BY created_at
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;

  if (!rows.length) return null;
  return rows[0] as unknown as JobRecord;
}

/**
 * Update job progress (called after each phase completes).
 */
export async function updateJobProgress(
  jobId: string,
  currentPhase: number,
  progress: JobRecord["progress"]
): Promise<void> {
  const sql = getSQL();
  if (!sql) return;

  await sql`
    UPDATE pipeline_jobs
    SET current_phase = ${currentPhase},
        progress = ${JSON.stringify(progress)},
        locked_at = now()
    WHERE id = ${jobId}
  `;
}

/**
 * Mark a job as completed with a reference to the saved report.
 */
export async function completeJob(jobId: string, reportId?: string): Promise<void> {
  const sql = getSQL();
  if (!sql) return;

  await sql`
    UPDATE pipeline_jobs
    SET status = 'completed',
        completed_at = now(),
        locked_by = NULL,
        locked_at = NULL,
        report_id = ${reportId ?? null}
    WHERE id = ${jobId}
  `;
}

/**
 * Mark a job as failed with an error message.
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  const sql = getSQL();
  if (!sql) return;

  await sql`
    UPDATE pipeline_jobs
    SET status = 'failed',
        completed_at = now(),
        locked_by = NULL,
        locked_at = NULL,
        error = ${error}
    WHERE id = ${jobId}
  `;
}

/**
 * Get the current status of a job.
 */
export async function getJobStatus(jobId: string): Promise<JobRecord | null> {
  const sql = getSQL();
  if (!sql) return null;

  const rows = await sql`
    SELECT * FROM pipeline_jobs WHERE id = ${jobId}
  `;
  if (!rows.length) return null;
  return rows[0] as unknown as JobRecord;
}

/**
 * List jobs for a user (most recent first).
 */
export async function listUserJobs(userId: string, limit = 20): Promise<JobRecord[]> {
  const sql = getSQL();
  if (!sql) return [];

  const rows = await sql`
    SELECT * FROM pipeline_jobs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as JobRecord[];
}

/**
 * Cancel a queued job (only works if not yet running).
 */
export async function cancelJob(jobId: string, userId: string): Promise<boolean> {
  const sql = getSQL();
  if (!sql) return false;

  const rows = await sql`
    UPDATE pipeline_jobs
    SET status = 'cancelled', completed_at = now()
    WHERE id = ${jobId}
      AND user_id = ${userId}
      AND status = 'queued'
    RETURNING id
  `;
  return rows.length > 0;
}
