"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Finding {
  id?: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  recommendation?: string;
  affected_component?: string;
}

interface Props {
  findings: Finding[];
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

function severityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge variant="critical">Critical</Badge>;
    case "high":
      return <Badge variant="destructive">High</Badge>;
    case "medium":
      return <Badge variant="warning">Medium</Badge>;
    case "low":
      return <Badge variant="success">Low</Badge>;
    default:
      return <Badge variant="secondary">Info</Badge>;
  }
}

export function FindingsTable({ findings }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string | null>(null);

  const sorted = [...findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 5) - (SEVERITY_ORDER[b.severity] ?? 5)
  );

  const filtered = filter ? sorted.filter((f) => f.severity === filter) : sorted;

  function toggle(idx: number) {
    const next = new Set(expanded);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpanded(next);
  }

  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No findings recorded in this report
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          All ({findings.length})
        </Button>
        {(["critical", "high", "medium", "low", "info"] as const).map((sev) => {
          const count = findings.filter((f) => f.severity === sev).length;
          if (count === 0) return null;
          return (
            <Button
              key={sev}
              variant={filter === sev ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filter === sev ? null : sev)}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)} ({count})
            </Button>
          );
        })}
      </div>

      {/* Findings list */}
      {filtered.map((f, i) => {
        const isOpen = expanded.has(i);

        return (
          <Card key={f.id || i} className="overflow-hidden">
            <button
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
              onClick={() => toggle(i)}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {severityBadge(f.severity)}
              <span className="font-medium flex-1 truncate">{f.title}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{f.category}</span>
            </button>

            {isOpen && (
              <CardContent className="border-t pt-4 space-y-3">
                <p className="text-sm">{f.description}</p>
                {f.affected_component && (
                  <div className="text-sm">
                    <span className="font-medium">Affected: </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{f.affected_component}</code>
                  </div>
                )}
                {f.recommendation && (
                  <div className="rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm">
                    <span className="font-medium">Recommendation: </span>
                    {f.recommendation}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
