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
import { ChartTooltip } from "./ChartTooltip";

interface GenerationTypesChartProps {
  data: Record<string, number>;
}

const COLORS = [
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#f97316", // Orange
  "#10b981", // Emerald
  "#eab308", // Yellow
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
      <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
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
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


