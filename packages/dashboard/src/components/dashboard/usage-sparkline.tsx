"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  daily: Array<{ date: string; calls: number }>;
}

export function UsageSparkline({ daily }: Props) {
  const data = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calls: d.calls,
  }));

  const total = daily.reduce((s, d) => s + d.calls, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          API Usage <span className="text-sm font-normal text-muted-foreground">(30 days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-2xl font-bold">{total.toLocaleString()} calls</div>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No usage data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data}>
              <XAxis dataKey="date" hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
