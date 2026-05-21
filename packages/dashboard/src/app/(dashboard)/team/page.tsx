"use client";

import { useState } from "react";
import { useTeam, createTeam, inviteTeamMember, removeTeamMember, changeTeamRole } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, UserPlus, Crown, Shield, Eye, Trash2 } from "lucide-react";

export default function TeamPage() {
  const { data, isLoading, mutate } = useTeam();
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const team = data?.team;

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      await createTeam(teamName.trim());
      setTeamName("");
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !team) return;
    setInviting(true);
    try {
      await inviteTeamMember(team.id, inviteEmail.trim());
      setInviteEmail("");
      setInviteOpen(false);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId: string) {
    if (!team || !confirm("Remove this member from the team?")) return;
    try {
      await removeTeamMember(team.id, userId);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!team) return;
    try {
      await changeTeamRole(team.id, userId, newRole);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to change role");
    }
  }

  // No team — show creation
  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Collaborate on security audits with your team</p>
        </div>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Create a Team</CardTitle>
            <CardDescription>
              Create a team to share reports and API keys with your colleagues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g. Security Team, DevOps"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
            </div>
            <Button onClick={handleCreateTeam} disabled={creating || !teamName.trim()}>
              <Users className="mr-2 h-4 w-4" />
              {creating ? "Creating…" : "Create Team"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has team — show members
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">
            {team.members.length} member{team.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? "Inviting…" : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-md border p-3">
                {/* Avatar placeholder */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(m.display_name || m.email || "?").charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {m.display_name || m.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>

                <RoleBadge role={m.role} />

                {/* Actions (only for non-self members) */}
                <div className="flex gap-1">
                  {m.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRoleChange(m.user_id, m.role === "member" ? "viewer" : "member")}
                      title="Toggle role"
                    >
                      {m.role === "member" ? <Eye className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                  )}
                  {m.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(m.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return (
        <Badge variant="default" className="gap-1">
          <Crown className="h-3 w-3" /> Admin
        </Badge>
      );
    case "member":
      return (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" /> Member
        </Badge>
      );
    case "viewer":
      return (
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" /> Viewer
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}
