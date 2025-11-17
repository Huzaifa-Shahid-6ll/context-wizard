"use client";

import React from "react";
import { CheckCircle2 } from "@/lib/icons";

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
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (highQualityRate * circumference);

  return (
    <div className="h-48 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary mb-1" />
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground">Success Rate</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {highQualityCount} high quality {highQualityCount === 1 ? "analysis" : "analyses"}
          {totalAnalyses !== undefined && ` out of ${totalAnalyses} total`}
        </p>
      </div>
    </div>
  );
}

