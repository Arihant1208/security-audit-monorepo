"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportSummary } from "@/lib/hooks";

interface Props {
  reports: ReportSummary[];
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "running":
      return <Badge variant="warning">Running</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function RecentReports({ reports }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports yet. Run a security audit to get started.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{r.project_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {r.risk_score !== null && (
                    <span
                      className={`text-sm font-semibold ${
                        Number(r.risk_score) > 7
                          ? "text-red-500"
                          : Number(r.risk_score) > 4
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {Number(r.risk_score).toFixed(1)}
                    </span>
                  )}
                  {statusBadge(r.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
