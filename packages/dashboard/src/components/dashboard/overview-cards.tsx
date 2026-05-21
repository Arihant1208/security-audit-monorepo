"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, ShieldAlert, Key } from "lucide-react";

interface Props {
  totalReports: number;
  avgRiskScore: number;
  criticalFindings: number;
  activeKeys: number;
}

export function OverviewCards({ totalReports, avgRiskScore, criticalFindings, activeKeys }: Props) {
  const cards = [
    {
      title: "Total Reports",
      value: totalReports.toString(),
      icon: FileText,
      description: "Audit reports generated",
    },
    {
      title: "Avg Risk Score",
      value: avgRiskScore.toFixed(1),
      icon: ShieldAlert,
      description: "Across all reports (0–10)",
      color: avgRiskScore > 7 ? "text-red-500" : avgRiskScore > 4 ? "text-amber-500" : "text-emerald-500",
    },
    {
      title: "Critical Findings",
      value: criticalFindings.toString(),
      icon: AlertTriangle,
      description: "Require immediate attention",
      color: criticalFindings > 0 ? "text-red-500" : "text-emerald-500",
    },
    {
      title: "Active API Keys",
      value: activeKeys.toString(),
      icon: Key,
      description: "Currently active",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color || ""}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
