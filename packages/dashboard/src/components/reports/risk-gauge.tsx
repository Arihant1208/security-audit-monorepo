"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface Props {
  score: number;
}

function scoreColor(score: number) {
  if (score >= 8) return "#ef4444";
  if (score >= 6) return "#f97316";
  if (score >= 4) return "#eab308";
  return "#22c55e";
}

function scoreLabel(score: number) {
  if (score >= 8) return "Critical";
  if (score >= 6) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

export function RiskGauge({ score }: Props) {
  const fill = scoreColor(score);
  const data = [{ name: "Risk", value: score * 10, fill }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={data}
              barSize={14}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "hsl(var(--secondary))" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="text-3xl font-bold" style={{ color: fill }}>
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">{scoreLabel(score)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
