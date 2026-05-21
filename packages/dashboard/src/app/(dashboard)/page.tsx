"use client";

import { useReports, useKeys, useUsage } from "@/lib/hooks";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RiskTrendChart } from "@/components/dashboard/risk-trend-chart";
import { SeverityPieChart } from "@/components/dashboard/severity-pie-chart";
import { RecentReports } from "@/components/dashboard/recent-reports";
import { UsageSparkline } from "@/components/dashboard/usage-sparkline";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: reportsData, isLoading: loadingReports } = useReports();
  const { data: keysData, isLoading: loadingKeys } = useKeys();
  const { data: usageData, isLoading: loadingUsage } = useUsage();

  const reports = reportsData?.reports ?? [];
  const keys = keysData?.keys ?? [];

  // Aggregate severity counts
  const totals = reports.reduce(
    (acc, r) => {
      if (r.summary) {
        acc.critical += r.summary.critical || 0;
        acc.high += r.summary.high || 0;
        acc.medium += r.summary.medium || 0;
        acc.low += r.summary.low || 0;
        acc.info += r.summary.info || 0;
      }
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  );

  const avgRisk =
    reports.length > 0
      ? reports.reduce((sum, r) => sum + (r.risk_score ?? 0), 0) / reports.length
      : 0;

  const activeKeys = keys.filter((k) => !k.revoked_at).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Security audit overview and key metrics
        </p>
      </div>

      {/* Overview cards */}
      {loadingReports || loadingKeys ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <OverviewCards
          totalReports={reports.length}
          avgRiskScore={avgRisk}
          criticalFindings={totals.critical}
          activeKeys={activeKeys}
        />
      )}

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        {loadingReports ? (
          <>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </>
        ) : (
          <>
            <RiskTrendChart reports={reports} />
            <SeverityPieChart totals={totals} />
          </>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 md:grid-cols-2">
        {loadingReports ? (
          <Skeleton className="h-64" />
        ) : (
          <RecentReports reports={reports.slice(0, 5)} />
        )}

        {loadingUsage ? (
          <Skeleton className="h-64" />
        ) : (
          <UsageSparkline daily={usageData?.daily ?? []} />
        )}
      </div>
    </div>
  );
}
