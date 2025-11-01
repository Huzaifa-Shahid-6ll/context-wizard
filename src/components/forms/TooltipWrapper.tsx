"use client";

import React from "react";

interface TooltipWrapperProps {
  content: string;
  glossaryTerm?: string;
  children: React.ReactNode;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ content, glossaryTerm, children }) => {
  const tooltipId = React.useId();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <span
      className="inline-block focus:outline-none focus-visible:ring-2 ring-primary/70 ring-offset-1 rounded"
      tabIndex={0}
      aria-describedby={tooltipId}
      ref={triggerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{ position: "relative" }}
    >
      {children}
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 min-w-max max-w-xs bg-background border border-border p-2 rounded shadow-md text-xs text-foreground focus:outline-none"
        >
          <span>{content}</span>
          {glossaryTerm && (
            <span className="block mt-1">
              <a
                href={`#glossary-${glossaryTerm.toLowerCase()}`}
                className="underline text-primary"
                tabIndex={0}
              >
                Learn more
              </a>
            </span>
          )}
        </span>
      )}
    </span>
  );
};
