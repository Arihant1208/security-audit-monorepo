"use client";

import React from "react";
import { useReport } from "@/lib/hooks";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { RiskGauge } from "@/components/reports/risk-gauge";
import { FindingsTable } from "@/components/reports/findings-table";
import { PipelineProgress } from "@/components/reports/pipeline-progress";

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useReport(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-60" />
          <Skeleton className="h-60 md:col-span-2" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data?.report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">Report not found</p>
        <Link href="/reports">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  const report = data.report;
  const summary = report.summary;
  const totalFindings = summary
    ? summary.critical + summary.high + summary.medium + summary.low + (summary.info || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.project_name}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(report.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Top row: Risk + Severity breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        <RiskGauge score={report.risk_score ?? 0} />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Findings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-3">
                <SeverityBar label="Critical" count={summary.critical} total={totalFindings} color="bg-red-500" />
                <SeverityBar label="High" count={summary.high} total={totalFindings} color="bg-orange-500" />
                <SeverityBar label="Medium" count={summary.medium} total={totalFindings} color="bg-amber-500" />
                <SeverityBar label="Low" count={summary.low} total={totalFindings} color="bg-emerald-500" />
                <SeverityBar label="Info" count={summary.info || 0} total={totalFindings} color="bg-gray-400" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No summary available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Findings / Pipeline / Business Context / Phase Outputs */}
      <Tabs defaultValue="findings">
        <TabsList>
          <TabsTrigger value="findings">
            Findings ({totalFindings})
          </TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="context">Business Context</TabsTrigger>
          {report.phase_outputs && Object.keys(report.phase_outputs).length > 0 && (
            <TabsTrigger value="phases">Phase Reports</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="findings" className="mt-4">
          <FindingsTable findings={report.findings ?? []} />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <PipelineProgress state={report.pipeline_state} />
        </TabsContent>

        <TabsContent value="context" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {report.business_context ? (
                <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(report.business_context, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No business context recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {report.phase_outputs && Object.keys(report.phase_outputs).length > 0 && (
          <TabsContent value="phases" className="mt-4">
            <PhaseOutputs outputs={report.phase_outputs} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>
      );
    case "running":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" /> Running
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SeverityBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium">{label}</span>
      <div className="flex-1">
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="w-8 text-right text-sm font-semibold">{count}</span>
    </div>
  );
}

const PHASE_LABELS: Record<string, string> = {
  business_context: "Business Context",
  system_discovery: "System Discovery",
  architecture: "Architecture Analysis",
  threat_model: "Threat Model",
  security_findings: "Security Findings",
  license_compliance: "License & Compliance",
  ai_opportunities: "AI & Security Opportunities",
  remediation_plan: "Remediation Plan",
  executive_summary: "Executive Summary",
  full_report: "Full Report",
};

function PhaseOutputs({ outputs }: { outputs: Record<string, string> }) {
  const [selected, setSelected] = React.useState<string>(Object.keys(outputs)[0] || "");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Phase selector sidebar */}
      <Card className="md:col-span-1">
        <CardContent className="p-2">
          <nav className="space-y-1">
            {Object.keys(outputs).map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selected === key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {PHASE_LABELS[key] || key.replace(/_/g, " ").replace(/^\d+-?/, "")}
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Markdown content */}
      <Card className="md:col-span-3">
        <CardContent className="p-6">
          {selected && outputs[selected] ? (
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[70vh]">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md">
                {outputs[selected]}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a phase to view its output</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
