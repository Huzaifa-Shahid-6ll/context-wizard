"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface PromptUsageChartProps {
  data: Array<{ date: string; count: number }>;
}

export function PromptUsageChart({ data }: PromptUsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  // Format dates for display (show month/day for last 7 days, otherwise just day)
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
      <LineChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
          formatter={(value: number) => [value, "Prompts"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

