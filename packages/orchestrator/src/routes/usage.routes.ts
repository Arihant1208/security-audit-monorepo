/**
 * Usage routes — tool call statistics
 */

import { Router } from "express";
import { getSQL } from "../infra/sql-client.js";
import { asyncHandler, requireSession, type AuthenticatedRequest } from "../middleware/index.js";

const router = Router();

// ── GET /usage ────────────────────────────────────────────────────────────
router.get("/usage", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const [total] = await sql`
    SELECT COUNT(*)::int as total,
           COUNT(DISTINCT DATE(ul.created_at))::int as active_days
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    WHERE ak.user_id = ${userId}
  `;

  const recent = await sql`
    SELECT ul.tool_name, COUNT(*)::int as calls, AVG(ul.latency_ms)::int as avg_ms
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    WHERE ak.user_id = ${userId}
      AND ul.created_at > now() - interval '30 days'
    GROUP BY ul.tool_name
    ORDER BY calls DESC
  `;

  const daily = await sql`
    SELECT DATE(ul.created_at) as date, COUNT(*)::int as calls
    FROM usage_logs ul
    JOIN api_keys ak ON ul.api_key_id = ak.id
    WHERE ak.user_id = ${userId}
      AND ul.created_at > now() - interval '30 days'
    GROUP BY DATE(ul.created_at)
    ORDER BY date
  `;

  res.json({ total: total || { total: 0, active_days: 0 }, by_tool: recent, daily });
}));

export { router as usageRouter };
