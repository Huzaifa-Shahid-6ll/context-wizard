"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FeatureUsageChartProps {
  data: Record<string, number>;
}

// Format feature names for display
function formatFeatureName(feature: string): string {
  return feature
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  // Convert record to array and sort by count
  const chartData = Object.entries(data)
    .map(([name, count]) => ({
      name: formatFeatureName(name),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={192}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            padding: "8px",
          }}
          formatter={(value: number) => [value, "Uses"]}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

