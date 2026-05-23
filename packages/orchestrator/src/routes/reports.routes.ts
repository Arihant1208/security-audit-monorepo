/**
 * Report routes — list, get, create
 */

import { Router } from "express";
import { z } from "zod";
import { getSQL } from "../infra/sql-client.js";
import { asyncHandler, AppError, validate, requireSession, type AuthenticatedRequest } from "../middleware/index.js";

const router = Router();

const createReportSchema = z.object({
  project_name: z.string().min(1, "project_name is required"),
  status: z.enum(["running", "completed", "failed"]).optional().default("completed"),
  risk_score: z.number().min(0).max(10).optional(),
  summary: z.record(z.number()).optional(),
  business_context: z.record(z.unknown()).optional(),
  findings: z.array(z.record(z.unknown())).optional(),
  pipeline_state: z.record(z.unknown()).optional(),
  phase_outputs: z.record(z.string()).optional(),
});

// ── GET /reports ──────────────────────────────────────────────────────────
router.get("/reports", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
  const teamId = userRow[0]?.team_id as string | null;

  let reports;
  if (teamId) {
    reports = await sql`
      SELECT r.id, r.project_name, r.status, r.risk_score, r.summary, r.created_at, r.completed_at,
             u.display_name as author_name
      FROM audit_reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ${userId} OR r.team_id = ${teamId}
      ORDER BY r.created_at DESC
      LIMIT 50
    `;
  } else {
    reports = await sql`
      SELECT id, project_name, status, risk_score, summary, created_at, completed_at
      FROM audit_reports WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
  }
  res.json({ reports });
}));

// ── GET /reports/:id ──────────────────────────────────────────────────────
router.get("/reports/:id", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
  const teamId = userRow[0]?.team_id as string | null;

  let rows;
  if (teamId) {
    rows = await sql`
      SELECT * FROM audit_reports
      WHERE id = ${req.params.id} AND (user_id = ${userId} OR team_id = ${teamId})
      LIMIT 1
    `;
  } else {
    rows = await sql`
      SELECT * FROM audit_reports
      WHERE id = ${req.params.id} AND user_id = ${userId}
      LIMIT 1
    `;
  }
  if (!rows.length) throw new AppError(404, "Report not found");

  res.json({ report: rows[0] });
}));

// ── POST /reports ─────────────────────────────────────────────────────────
router.post("/reports", asyncHandler(requireSession), validate(createReportSchema), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const { project_name, status, risk_score, summary, business_context, findings, pipeline_state, phase_outputs } = req.body;

  const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
  const teamId = userRow[0]?.team_id ?? null;

  const rows = await sql`
    INSERT INTO audit_reports (user_id, team_id, project_name, status, risk_score, summary, business_context, findings, pipeline_state, phase_outputs, completed_at)
    VALUES (
      ${userId},
      ${teamId},
      ${project_name},
      ${status},
      ${risk_score ?? null},
      ${summary ? JSON.stringify(summary) : null}::jsonb,
      ${business_context ? JSON.stringify(business_context) : null}::jsonb,
      ${findings ? JSON.stringify(findings) : null}::jsonb,
      ${pipeline_state ? JSON.stringify(pipeline_state) : null}::jsonb,
      ${phase_outputs ? JSON.stringify(phase_outputs) : null}::jsonb,
      ${status === "completed" ? new Date().toISOString() : null}
    )
    RETURNING id, project_name, status, risk_score, created_at
  `;

  res.status(201).json({ report: rows[0] });
}));

export { router as reportsRouter };
