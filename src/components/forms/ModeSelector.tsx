import React from "react";

export type Mode = "quick" | "standard" | "advanced";

interface ModeSelectorProps {
  featureKey: string; // unique for each feature/page
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: "quick", label: "Quick", desc: "Essentials only" },
  { value: "standard", label: "Standard", desc: "Balance of detail" },
  { value: "advanced", label: "Advanced", desc: "All options" },
];

/**
 * ModeSelector, now with ARIA roles and accessible description.
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({ featureKey, mode, onChange }) => {
  React.useEffect(() => {
    localStorage.setItem(`mode:${featureKey}`, mode);
  }, [featureKey, mode]);

  const descId = `mode-desc-${featureKey}`;

  return (
    <div
      className="flex gap-2 items-center mb-6"
      role="radiogroup"
      aria-label="Prompt entry mode selector"
      aria-describedby={descId}
    >
      <span className="font-medium text-sm">Mode:</span>
      {MODES.map((m) => (
        <button
          key={m.value}
          className={`px-3 py-1 rounded-md border text-xs font-semibold focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary transition-colors ${
            m.value === mode ? 'bg-primary text-white border-primary' : 'bg-background border-accent text-foreground/70'
          }`}
          role="radio"
          aria-checked={m.value === mode}
          tabIndex={0}
          aria-label={m.label}
          aria-describedby={descId}
          onClick={() => onChange(m.value)}
        >
          {m.label}
          {/* Screen reader description for visually-hidden extra detail */}
          {m.value === mode && (
            <span className="sr-only">(selected: {m.desc})</span>
          )}
        </button>
      ))}
      <span id={descId} className="sr-only">
        Choose &quot;Quick&quot; for just essentials, &quot;Standard&quot; for balance, &quot;Advanced&quot; for all fields.
      </span>
    </div>
  );
};
