/**
 * Pipeline job routes — async audit execution.
 *
 * POST /jobs        — Enqueue a new audit job
 * GET  /jobs        — List user's jobs
 * GET  /jobs/:id    — Get job status
 * POST /jobs/:id/cancel — Cancel a queued job
 */

import { Router } from "express";
import { z } from "zod";
import { asyncHandler, AppError, validate, requireSession, type AuthenticatedRequest } from "../middleware/index.js";
import {
  enqueueJob,
  getJobStatus,
  listUserJobs,
  cancelJob,
} from "../pipeline/queue.js";

const router = Router();

const createJobSchema = z.object({
  project_name: z.string().min(1).max(200),
  target: z.string().min(1).max(500),
  phases: z.array(z.number().int().min(0).max(8)).optional(),
  config: z.record(z.unknown()).optional(),
});

// POST /jobs — enqueue a new audit
router.post(
  "/jobs",
  requireSession,
  validate(createJobSchema),
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthenticatedRequest;
    const { project_name, target, phases, config } = req.body;

    const jobId = await enqueueJob({
      userId,
      projectName: project_name,
      target,
      phases,
      config,
    });

    res.status(202).json({
      id: jobId,
      status: "queued",
      message: "Audit job enqueued. Poll GET /api/jobs/:id for progress.",
    });
  })
);

// GET /jobs — list user's jobs
router.get(
  "/jobs",
  requireSession,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthenticatedRequest;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const jobs = await listUserJobs(userId, limit);
    res.json({ jobs });
  })
);

// GET /jobs/:id — get job status
router.get(
  "/jobs/:id",
  requireSession,
  asyncHandler(async (req, res) => {
    const job = await getJobStatus(req.params.id as string);
    if (!job) {
      throw new AppError(404, "Job not found");
    }
    res.json(job);
  })
);

// POST /jobs/:id/cancel — cancel a queued job
router.post(
  "/jobs/:id/cancel",
  requireSession,
  asyncHandler(async (req, res) => {
    const { userId } = req as AuthenticatedRequest;
    const cancelled = await cancelJob(req.params.id as string, userId);
    if (!cancelled) {
      throw new AppError(400, "Job cannot be cancelled (already running or completed)");
    }
    res.json({ status: "cancelled" });
  })
);

export { router as jobsRouter };
