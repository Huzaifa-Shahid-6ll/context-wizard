"use client";

import React from "react";

type PlatformTargetSelectorProps = {
  options: string[];
  value: string | undefined;
  onChange: (next: string) => void;
  label?: string;
};

export function PlatformTargetSelector({ options, value, onChange, label }: PlatformTargetSelectorProps) {
  return (
    <div>
      {label && <div className="mb-1 block text-xs text-foreground/60">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${value === opt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}


