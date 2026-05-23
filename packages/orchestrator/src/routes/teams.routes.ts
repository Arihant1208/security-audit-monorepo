/**
 * Team routes — create, get, invite, remove member, change role
 */

import { Router } from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { getSQL } from "../infra/sql-client.js";
import { asyncHandler, AppError, validate, requireSession, type AuthenticatedRequest } from "../middleware/index.js";

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").transform((s) => s.trim()),
});

const inviteSchema = z.object({
  email: z.string().email("Valid email required").transform((s) => s.trim()),
});

const changeRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"], { message: "Role must be admin, member, or viewer" }),
});

// ── GET /team ─────────────────────────────────────────────────────────────
router.get("/team", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
  const teamId = userRow[0]?.team_id as string | null;

  if (!teamId) {
    res.json({ team: null });
    return;
  }

  const [team] = await sql`SELECT id, name, created_at FROM teams WHERE id = ${teamId}`;
  if (!team) {
    res.json({ team: null });
    return;
  }

  const members = await sql`
    SELECT tm.id, tm.user_id, tm.role, tm.joined_at,
           u.email, u.display_name
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ${teamId}
    ORDER BY tm.joined_at ASC
  `;

  res.json({ team: { ...team, members } });
}));

// ── POST /teams ───────────────────────────────────────────────────────────
router.post("/teams", asyncHandler(requireSession), validate(createTeamSchema), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const { name } = req.body;

  const userRow = await sql`SELECT team_id FROM users WHERE id = ${userId} LIMIT 1`;
  if (userRow[0]?.team_id) throw new AppError(409, "You are already on a team");

  const teamId = randomUUID();
  await sql`INSERT INTO teams (id, name) VALUES (${teamId}, ${name})`;

  await sql`
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (${teamId}, ${userId}, 'admin')
  `;

  await sql`UPDATE users SET team_id = ${teamId} WHERE id = ${userId}`;

  res.status(201).json({ team: { id: teamId, name, members: [] } });
}));

// ── POST /teams/:id/invite ────────────────────────────────────────────────
router.post("/teams/:id/invite", asyncHandler(requireSession), validate(inviteSchema), asyncHandler(async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const sql = getSQL()!;

  const teamId = req.params.id;
  const { email } = req.body;

  // Verify user is admin
  const membership = await sql`
    SELECT role FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${userId}
    LIMIT 1
  `;
  if (!membership.length || membership[0].role !== "admin") {
    throw new AppError(403, "Only team admins can invite members");
  }

  // Check if already member
  const existingMember = await sql`
    SELECT u.id FROM users u
    JOIN team_members tm ON tm.user_id = u.id AND tm.team_id = ${teamId}
    WHERE u.email = ${email}
    LIMIT 1
  `;
  if (existingMember.length) throw new AppError(409, "User is already a team member");

  // Add directly if user exists, otherwise create invite
  const invitedUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (invitedUser.length) {
    const iUserId = invitedUser[0].id as string;
    await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${teamId}, ${iUserId}, 'member')
      ON CONFLICT (team_id, user_id) DO NOTHING
    `;
    await sql`UPDATE users SET team_id = ${teamId} WHERE id = ${iUserId}`;
    res.json({ ok: true, added_directly: true });
  } else {
    const token = randomBytes(32).toString("hex");
    await sql`
      INSERT INTO team_invites (team_id, email, invited_by, token)
      VALUES (${teamId}, ${email}, ${userId}, ${token})
    `;
    res.json({ ok: true, invite_token: token });
  }
}));

// ── DELETE /teams/:id/members/:userId ─────────────────────────────────────
router.delete("/teams/:id/members/:userId", asyncHandler(requireSession), asyncHandler(async (req, res) => {
  const currentUserId = (req as AuthenticatedRequest).userId;
  const sql = getSQL()!;

  const teamId = req.params.id;
  const targetUserId = req.params.userId;

  const membership = await sql`
    SELECT role FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${currentUserId}
    LIMIT 1
  `;
  if (!membership.length || membership[0].role !== "admin") {
    throw new AppError(403, "Only team admins can remove members");
  }

  if (targetUserId === currentUserId) {
    throw new AppError(400, "Cannot remove yourself. Transfer admin role first.");
  }

  await sql`DELETE FROM team_members WHERE team_id = ${teamId} AND user_id = ${targetUserId}`;
  await sql`UPDATE users SET team_id = NULL WHERE id = ${targetUserId} AND team_id = ${teamId}`;

  res.json({ ok: true });
}));

// ── PATCH /teams/:id/members/:userId ──────────────────────────────────────
router.patch("/teams/:id/members/:userId", asyncHandler(requireSession), validate(changeRoleSchema), asyncHandler(async (req, res) => {
  const currentUserId = (req as AuthenticatedRequest).userId;
  const sql = getSQL()!;

  const teamId = req.params.id;
  const targetUserId = req.params.userId;
  const { role } = req.body;

  const membership = await sql`
    SELECT role FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${currentUserId}
    LIMIT 1
  `;
  if (!membership.length || membership[0].role !== "admin") {
    throw new AppError(403, "Only team admins can change roles");
  }

  await sql`
    UPDATE team_members SET role = ${role}
    WHERE team_id = ${teamId} AND user_id = ${targetUserId}
  `;

  res.json({ ok: true });
}));

export { router as teamsRouter };
