"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface GenerationTypesChartProps {
  data: Record<string, number>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
];

// Format type names for display
function formatTypeName(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function GenerationTypesChart({ data }: GenerationTypesChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name: formatTypeName(name),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={192}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={60}
          fill="hsl(var(--primary))"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            padding: "8px",
          }}
          formatter={(value: number) => [value, "Prompts"]}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          iconType="circle"
          formatter={(value) => formatTypeName(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

