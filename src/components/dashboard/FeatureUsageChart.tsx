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
  Cell,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

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
      <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
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
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.1}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#E2E8F0"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={<ChartTooltip labelFormatter={(label) => `${label}`} />}
            cursor={{ fill: "hsl(var(--muted)/0.2)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#colorBar)">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


