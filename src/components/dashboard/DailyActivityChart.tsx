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

interface DailyActivityChartProps {
  data: Array<{ date: string; count: number }>;
}

export function DailyActivityChart({ data }: DailyActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
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
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="dayLabel"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
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
          labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "4px" }}
          formatter={(value: number) => [value, "Activity"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="url(#colorActivity)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

