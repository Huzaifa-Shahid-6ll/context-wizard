"use client";

import React from "react";

type ChipsMultiSelectProps = {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

export function ChipsMultiSelect({ options, value, onChange, className }: ChipsMultiSelectProps) {
  const selected = new Set(value || []);
  function toggle(opt: string) {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(Array.from(next));
  }
  return (
    <div className={"flex flex-wrap gap-2 " + (className || "") }>
      {options.map((opt) => {
        const active = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary/20"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}


