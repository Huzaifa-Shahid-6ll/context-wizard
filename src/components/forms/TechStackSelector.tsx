"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TooltipWrapper } from "./TooltipWrapper";

interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  tools: string[];
}

interface TechStackSelectorProps {
  value: TechStack;
  onChange: (value: TechStack) => void;
}

export const TechStackSelector: React.FC<TechStackSelectorProps> = ({ value, onChange }) => {
  const handleToolChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTool = e.currentTarget.value.trim();
      if (newTool && !value.tools.includes(newTool)) {
        onChange({ ...value, tools: [...value.tools, newTool] });
        e.currentTarget.value = "";
      }
    }
  };

  const removeTool = (tool: string) => {
    onChange({ ...value, tools: value.tools.filter((t) => t !== tool) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>
            <TooltipWrapper content="Select the primary frontend framework.">
              Frontend
            </TooltipWrapper>
          </Label>
          <Select
            value={value.frontend}
            onChange={(e) => onChange({ ...value, frontend: e.target.value })}
          >
            <option value="">Select frontend...</option>
            <option value="React">React</option>
            <option value="Vue">Vue</option>
            <option value="Svelte">Svelte</option>
            <option value="Angular">Angular</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <div>
          <Label>
            <TooltipWrapper content="Select the primary backend language/framework.">
              Backend
            </TooltipWrapper>
          </Label>
          <Select
            value={value.backend}
            onChange={(e) => onChange({ ...value, backend: e.target.value })}
          >
            <option value="">Select backend...</option>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
            <option value="Go">Go</option>
            <option value="Java">Java</option>
            <option value="Rust">Rust</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <div>
          <Label>
            <TooltipWrapper content="Select the primary database.">
              Database
            </TooltipWrapper>
          </Label>
          <Select
            value={value.database}
            onChange={(e) => onChange({ ...value, database: e.target.value })}
          >
            <option value="">Select database...</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MongoDB">MongoDB</option>
            <option value="MySQL">MySQL</option>
            <option value="SQLite">SQLite</option>
            <option value="Other">Other</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>
          <TooltipWrapper content="List any additional tools or libraries (e.g., Docker, Stripe, etc.). Press Enter to add.">
            Other Tools
          </TooltipWrapper>
        </Label>
        <Input
          placeholder="Add a tool and press Enter..."
          onKeyDown={handleToolChange}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {value.tools.map((tool) => (
            <div key={tool} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
              {tool}
              <button
                type="button"
                onClick={() => removeTool(tool)}
                className="text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
