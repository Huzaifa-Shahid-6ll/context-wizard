"use client";

import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface SuccessRateChartProps {
  highQualityCount: number;
  highQualityRate: number;
  totalAnalyses?: number;
}

export function SuccessRateChart({
  highQualityCount,
  highQualityRate,
  totalAnalyses,
}: SuccessRateChartProps) {
  const percentage = Math.round(highQualityRate * 100);

  const data = [
    {
      name: "Success Rate",
      value: percentage,
      fill: "url(#successGradient)",
    },
  ];

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative">
      <div className="relative w-full flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            barSize={32}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(var(--muted)/0.1)" }}
              dataKey="value"
              cornerRadius={16}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Centered Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-bold tracking-tighter text-foreground">
            {percentage}%
          </span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            Success Rate
          </span>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-6 text-center space-y-1">
        <div className="text-2xl font-bold text-foreground">
          {highQualityCount}
        </div>
        <p className="text-sm text-muted-foreground">
          High quality analyses
        </p>
      </div>
    </div>
  );
}


