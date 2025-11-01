import React from "react";

export interface Template {
  id: string;
  name: string;
  description: string;
  fields: Record<string, unknown>;
  preview?: React.ReactNode;
}

interface TemplateLibraryProps {
  templates: Template[];
  onApply: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ templates, onApply }) => {
  if (!templates.length) return null;
  return (
    <div className="mb-6">
      <div className="font-semibold mb-2">Templates</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-lg border p-3 bg-background shadow-sm flex flex-col justify-between">
            <div className="mb-2">
              <div className="font-medium">{tpl.name}</div>
              <div className="text-xs text-foreground/60 mb-1">{tpl.description}</div>
              {tpl.preview && <div className="mb-1">{tpl.preview}</div>}
            </div>
            <button
              className="mt-2 px-2 py-1 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/80"
              onClick={() => onApply(tpl)}
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
