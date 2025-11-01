"use client";

import React from "react";

type PromptPreviewProps = {
  id?: string;
  ariaLabel?: string;
  title?: string;
  children: React.ReactNode;
};

export function PromptPreview({ id, ariaLabel, title = "Live Preview", children }: PromptPreviewProps) {
  return (
    <div
      className="p-3 mb-2 rounded-md border border-primary/20 bg-primary/5"
      id={id}
      aria-live="polite"
      role="region"
      aria-label={ariaLabel || "Prompt live preview section"}
    >
      <div className="font-semibold text-xs text-primary mb-1">{title}</div>
      <div className="whitespace-pre-wrap text-sm">
        {children}
      </div>
    </div>
  );
}


