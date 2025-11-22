"use client";

import React from "react";

interface ChartTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    valueFormatter?: (value: number) => string;
    labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
    active,
    payload,
    label,
    valueFormatter = (value) => `${value}`,
    labelFormatter = (label) => `${label}`,
}: ChartTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/60 p-3 shadow-xl backdrop-blur-md ring-1 ring-white/5">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {labelFormatter(label || "")}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-sm font-bold text-foreground">
                            {valueFormatter(entry.value)}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                            {entry.name}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
