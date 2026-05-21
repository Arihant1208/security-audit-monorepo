"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReportSummary } from "@/lib/hooks";

interface Props {
  reports: ReportSummary[];
}

export function RiskTrendChart({ reports }: Props) {
  const data = [...reports]
    .filter((r) => r.risk_score !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      risk: r.risk_score,
      name: r.project_name,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risk Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            No completed reports yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
