"use client";

import React from "react";
import { ChipsMultiSelect } from "@/components/forms/ChipsMultiSelect";

const DEFAULT_NEGATIVES = ["Blurry","Low quality","Distorted","Extra limbs","Text artifacts"];

type NegativePromptsInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function NegativePromptsInput({ value, onChange }: NegativePromptsInputProps) {
  const [custom, setCustom] = React.useState("");
  function addCustom() {
    const v = custom.trim();
    if (!v) return;
    const next = Array.from(new Set([...(value || []), v]));
    onChange(next);
    setCustom("");
  }
  return (
    <div className="space-y-2">
      <ChipsMultiSelect options={DEFAULT_NEGATIVES} value={value || []} onChange={onChange} />
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 ring-primary"
          placeholder="Add custom negative and press Add"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="button" onClick={addCustom} className="rounded-md border px-3 py-2 text-sm hover:bg-secondary/20">
          Add
        </button>
      </div>
    </div>
  );
}


