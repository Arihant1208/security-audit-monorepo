"use client";

import { useState } from "react";
import { useKeys, createApiKey, revokeApiKey, type ApiKey } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Copy, Check, Trash2, Key } from "lucide-react";

export default function KeysPage() {
  const { data, isLoading, mutate } = useKeys();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const keys = data?.keys ?? [];
  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const result = await createApiKey(newKeyName.trim());
      setRawKey(result.key.raw_key);
      setNewKeyName("");
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      await revokeApiKey(id);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke key");
    }
  }

  function handleCopy() {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCloseCreate() {
    setCreateOpen(false);
    setRawKey(null);
    setNewKeyName("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for the Steve MCP server
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={(open) => (open ? setCreateOpen(true) : handleCloseCreate())}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {rawKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy this key now. You will not be able to see it again.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                  <code className="flex-1 break-all text-sm font-mono">{rawKey}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseCreate}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Give your key a name to identify it later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Production, CI/CD, Development"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                    {creating ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Active keys */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Keys</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : activeKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <Key className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No active keys. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeKeys.map((k) => (
              <KeyRow key={k.id} apiKey={k} onRevoke={() => handleRevoke(k.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Revoked Keys</h2>
          <div className="space-y-2 opacity-60">
            {revokedKeys.map((k) => (
              <KeyRow key={k.id} apiKey={k} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke?: () => void }) {
  const isRevoked = !!apiKey.revoked_at;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Key className="h-5 w-5 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{apiKey.name}</span>
            {isRevoked && <Badge variant="destructive">Revoked</Badge>}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
            <code>{apiKey.key_prefix}…</code>
            <span>Created {new Date(apiKey.created_at).toLocaleDateString()}</span>
            {apiKey.last_used_at && (
              <span>Last used {new Date(apiKey.last_used_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {!isRevoked && onRevoke && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRevoke}>
            <Trash2 className="h-4 w-4 mr-1" /> Revoke
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
