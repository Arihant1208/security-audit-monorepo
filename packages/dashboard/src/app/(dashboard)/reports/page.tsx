"use client";

import { useState } from "react";
import Link from "next/link";
import { useReports, uploadReport } from "@/lib/hooks";
import type { ReportSummary } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Upload, Search, ArrowUpDown, FileText } from "lucide-react";

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

function severityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-500";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-emerald-500";
    default:
      return "text-muted-foreground";
  }
}

export default function ReportsPage() {
  const { data, isLoading, mutate } = useReports();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "risk_score">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reports = data?.reports ?? [];

  const filtered = reports
    .filter((r) => r.project_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = sortField === "risk_score" ? (a.risk_score ?? 0) : new Date(a.created_at).getTime();
      const bVal = sortField === "risk_score" ? (b.risk_score ?? 0) : new Date(b.created_at).getTime();
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

  function toggleSort(field: "created_at" | "risk_score") {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await uploadReport({
        project_name: json.project_name || file.name.replace(".json", ""),
        status: json.status || "completed",
        risk_score: json.risk_score,
        summary: json.summary,
        findings: json.findings,
        business_context: json.business_context,
        pipeline_state: json.pipeline_state,
        phase_outputs: json.phase_outputs,
      });
      mutate();
      setUploadOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">View and manage security audit reports</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleUpload}>
              <DialogHeader>
                <DialogTitle>Upload Audit Report</DialogTitle>
                <DialogDescription>Upload a JSON report file from a Steve audit</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input name="file" type="file" accept=".json" required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => toggleSort("created_at")}>
          <ArrowUpDown className="mr-1 h-3 w-3" />
          Date
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleSort("risk_score")}>
          <ArrowUpDown className="mr-1 h-3 w-3" />
          Risk
        </Button>
      </div>

      {/* Report list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {search ? "No reports match your search" : "No reports yet. Run a security audit to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportRow({ report }: { report: ReportSummary }) {
  const summary = report.summary;

  return (
    <Link href={`/reports/${report.id}`}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
        <CardContent className="flex items-center gap-6 p-4">
          {/* Risk score */}
          <div className="flex-shrink-0 text-center w-16">
            <div
              className={`text-2xl font-bold ${
                Number(report.risk_score ?? 0) > 7
                  ? "text-red-500"
                  : Number(report.risk_score ?? 0) > 4
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {report.risk_score != null ? Number(report.risk_score).toFixed(1) : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Risk</div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{report.project_name}</span>
              {statusBadge(report.status)}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(report.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Severity counts */}
          {summary && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
              {summary.critical > 0 && <span className="text-red-500">{summary.critical} C</span>}
              {summary.high > 0 && <span className="text-orange-500">{summary.high} H</span>}
              {summary.medium > 0 && <span className="text-amber-500">{summary.medium} M</span>}
              {summary.low > 0 && <span className="text-emerald-500">{summary.low} L</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
