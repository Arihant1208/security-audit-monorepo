"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { ReportStatus } from "@/lib/types";

const STATUS_MAP: Record<ReportStatus, { icon: typeof CheckCircle; variant: "success" | "warning" | "destructive"; label: string }> = {
  completed: { icon: CheckCircle, variant: "success", label: "Completed" },
  running: { icon: Clock, variant: "warning", label: "Running" },
  failed: { icon: XCircle, variant: "destructive", label: "Failed" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status as ReportStatus];
  if (!config) return <Badge variant="outline">{status}</Badge>;

  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" /> {config.label}
    </Badge>
  );
}
