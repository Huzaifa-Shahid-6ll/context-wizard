"use client";
import React, { useEffect } from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BarChart2, TrendingUp, Activity, Github } from "@/lib/icons";
import { PromptUsageChart } from "@/components/dashboard/PromptUsageChart";
import { GenerationTypesChart } from "@/components/dashboard/GenerationTypesChart";
import { FeatureUsageChart } from "@/components/dashboard/FeatureUsageChart";
import { SuccessRateChart } from "@/components/dashboard/SuccessRateChart";
import { DailyActivityChart } from "@/components/dashboard/DailyActivityChart";

export default function DashboardHome() {
  const { user } = useUser();
  const userId = user?.id;

  // Fetch analytics data
  const timeSeriesData = useQuery(
    api.queries.getPromptTimeSeries,
    userId ? { userId } : "skip"
  );

  const promptStats = useQuery(
    api.queries.getPromptStats,
    userId ? { userId } : "skip"
  );

  useEffect(() => {
    initPostHog();
    trackEvent("dashboard_viewed");
  }, []);

  const isLoading = userId && (timeSeriesData === undefined || promptStats === undefined);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Analytics Dashboard</h1>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Prompt Usage Over Time */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Prompt Usage</CardTitle>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <PromptUsageChart data={timeSeriesData || []} />
          )}
        </Card>

        {/* Generation Types Breakdown */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Generation Types</CardTitle>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <GenerationTypesChart data={promptStats?.totalsByType || {}} />
          )}
        </Card>

        {/* Tech Stack Popularity */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Tech Stack</CardTitle>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center bg-secondary/10 rounded-lg border border-border">
            <div className="text-center">
              <Github className="h-12 w-12 mx-auto mb-2 text-foreground/40" />
              <p className="text-sm text-foreground/60">Coming soon</p>
              <p className="text-xs text-foreground/40 mt-1">Tech stack analytics will be available soon</p>
            </div>
          </div>
        </Card>

        {/* Daily Activity */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Daily Activity</CardTitle>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <DailyActivityChart data={timeSeriesData || []} />
          )}
        </Card>

        {/* Success Rate */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Success Rate</CardTitle>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <SuccessRateChart
              highQualityCount={promptStats?.successMetrics.highQualityCount || 0}
              highQualityRate={promptStats?.successMetrics.highQualityRate || 0}
            />
          )}
        </Card>

        {/* Feature Usage */}
        <Card className="p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Feature Usage</CardTitle>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <FeatureUsageChart data={promptStats?.featureUsageCounts || {}} />
          )}
        </Card>
      </div>

    </div>
  );
}
