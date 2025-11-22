"use client";
import React, { useEffect } from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BarChart2, TrendingUp, Activity, Zap } from "@/lib/icons";
import { PromptUsageChart } from "@/components/dashboard/PromptUsageChart";
import { GenerationTypesChart } from "@/components/dashboard/GenerationTypesChart";
import { FeatureUsageChart } from "@/components/dashboard/FeatureUsageChart";
import { SuccessRateChart } from "@/components/dashboard/SuccessRateChart";
import { DailyActivityChart } from "@/components/dashboard/DailyActivityChart";
import { cn } from "@/lib/utils";

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

  const cardClass = "bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl ring-1 ring-white/5 transition-all hover:ring-white/10 hover:bg-black/50";
  const titleClass = "text-lg font-medium text-foreground/90 tracking-tight";
  const iconClass = "h-5 w-5 text-primary/80";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your AI generation metrics and usage patterns.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

        {/* Prompt Usage - Large Card */}
        <Card className={cn(cardClass, "lg:col-span-2 lg:row-span-2")}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <TrendingUp className={iconClass} />
                </div>
                <CardTitle className={titleClass}>Prompt Usage Trend</CardTitle>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                  Loading data...
                </div>
              ) : (
                <PromptUsageChart data={timeSeriesData || []} />
              )}
            </div>
          </div>
        </Card>

        {/* Success Rate - Square Card */}
        <Card className={cn(cardClass, "lg:col-span-1 lg:row-span-2")}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <CheckCircle2 className={iconClass} />
                </div>
                <CardTitle className={titleClass}>Success Rate</CardTitle>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
              ) : (
                <SuccessRateChart
                  highQualityCount={promptStats?.successMetrics.highQualityCount || 0}
                  highQualityRate={promptStats?.successMetrics.highQualityRate || 0}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Generation Types - Medium Card */}
        <Card className={cn(cardClass, "lg:col-span-1")}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <BarChart2 className={iconClass} />
                </div>
                <CardTitle className={titleClass}>Generation Types</CardTitle>
              </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                  Loading...
                </div>
              ) : (
                <GenerationTypesChart data={promptStats?.totalsByType || {}} />
              )}
            </div>
          </div>
        </Card>

        {/* Feature Usage - Medium Card */}
        <Card className={cn(cardClass, "lg:col-span-1")}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Zap className={iconClass} />
                </div>
                <CardTitle className={titleClass}>Feature Usage</CardTitle>
              </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                  Loading...
                </div>
              ) : (
                <FeatureUsageChart data={promptStats?.featureUsageCounts || {}} />
              )}
            </div>
          </div>
        </Card>

        {/* Daily Activity - Medium Card */}
        <Card className={cn(cardClass, "lg:col-span-1")}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Activity className={iconClass} />
                </div>
                <CardTitle className={titleClass}>Daily Activity</CardTitle>
              </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                  Loading...
                </div>
              ) : (
                <DailyActivityChart data={timeSeriesData || []} />
              )}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
