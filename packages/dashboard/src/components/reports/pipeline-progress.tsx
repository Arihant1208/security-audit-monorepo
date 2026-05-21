"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  "Business Discovery",
  "System Discovery",
  "Architecture Mapping",
  "Threat Modeling",
  "Layered Security Audit",
  "License Compliance",
  "AI Opportunity Analysis",
  "Risk & Remediation",
  "Report Generation",
];

interface Props {
  state: Record<string, unknown> | null;
}

function phaseStatus(state: Record<string, unknown> | null, index: number) {
  if (!state) return "pending";
  // Try various state shapes
  const phases = (state.phases as Array<{ status?: string }>) ?? [];
  if (phases[index]) return phases[index].status || "pending";
  return "pending";
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
    case "done":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "running":
    case "in_progress":
      return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
    case "failed":
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground/40" />;
  }
}

export function PipelineProgress({ state }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audit Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {PHASES.map((phase, i) => {
            const status = phaseStatus(state, i);
            const isLast = i === PHASES.length - 1;

            return (
              <div key={phase} className="flex items-start gap-4">
                {/* Connector line + icon */}
                <div className="flex flex-col items-center">
                  <StatusIcon status={status} />
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 h-8",
                        ["completed", "done"].includes(status)
                          ? "bg-emerald-500"
                          : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-8">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    Phase {i + 1}: {phase}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
