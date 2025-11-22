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
import { format, parseISO } from "date-fns";
import { ChartTooltip } from "./ChartTooltip";

interface DailyActivityChartProps {
  data: Array<{ date: string; count: number }>;
}

export function DailyActivityChart({ data }: DailyActivityChartProps) {
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
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
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
            cursor={{ fill: "hsl(var(--muted)/0.2)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#colorDaily)">
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


