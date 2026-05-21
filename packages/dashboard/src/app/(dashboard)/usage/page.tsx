"use client";

import { useUsage } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Activity, Calendar } from "lucide-react";

const TOOL_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function UsagePage() {
  const { data, isLoading } = useUsage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-80" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const totalCalls = data?.total?.total ?? 0;
  const activeDays = data?.total?.active_days ?? 0;
  const byTool = data?.by_tool ?? [];
  const daily = (data?.daily ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calls: d.calls,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
        <p className="text-muted-foreground">API usage analytics for the last 30 days</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDays}</div>
            <p className="text-xs text-muted-foreground">Days with at least one call</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-muted-foreground">
              No usage data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="calls" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tool breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calls by Tool</CardTitle>
          </CardHeader>
          <CardContent>
            {byTool.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                No tool data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byTool.map((t) => ({ name: t.tool_name, value: t.calls }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {byTool.map((_, i) => (
                      <Cell key={i} fill={TOOL_COLORS[i % TOOL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tool Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {byTool.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tool data</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Tool</th>
                      <th className="text-right py-2 font-medium">Calls</th>
                      <th className="text-right py-2 font-medium">Avg (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byTool
                      .sort((a, b) => b.calls - a.calls)
                      .map((t) => (
                        <tr key={t.tool_name} className="border-b last:border-0">
                          <td className="py-2 font-mono text-xs">{t.tool_name}</td>
                          <td className="text-right py-2">{t.calls.toLocaleString()}</td>
                          <td className="text-right py-2 text-muted-foreground">{t.avg_ms}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
