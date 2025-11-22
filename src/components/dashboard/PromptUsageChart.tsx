"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ChartTooltip } from "./ChartTooltip";

interface PromptUsageChartProps {
  data: Array<{ date: string; count: number }>;
}

export function PromptUsageChart({ data }: PromptUsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => {
    const date = parseISO(item.date);
    const dayLabel = format(date, "MMM d");
    return {
      ...item,
      dayLabel,
    };
  });

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.1}
            vertical={false}
          />
          <XAxis
            dataKey="dayLabel"
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
            cursor={{
              stroke: "#06b6d4",
              strokeWidth: 1,
              strokeDasharray: "5 5",
              opacity: 0.5,
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Prompts"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


