"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TooltipWrapper } from "./TooltipWrapper";

interface Constraints {
  mvpDate: string;
  launchDate: string;
  devBudget: string;
  infraBudget: string;
  teamSize: string;
}

interface ConstraintsInputProps {
  value: Constraints;
  onChange: (value: Constraints) => void;
}

export const ConstraintsInput: React.FC<ConstraintsInputProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof Constraints, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>
            <TooltipWrapper content="The target date for the Minimum Viable Product.">
              MVP Date
            </TooltipWrapper>
          </Label>
          <Input
            type="date"
            value={value.mvpDate}
            onChange={(e) => handleChange("mvpDate", e.target.value)}
          />
        </div>
        <div>
          <Label>
            <TooltipWrapper content="The target date for the full product launch.">
              Launch Date
            </TooltipWrapper>
          </Label>
          <Input
            type="date"
            value={value.launchDate}
            onChange={(e) => handleChange("launchDate", e.target.value)}
          />
        </div>
        <div>
          <Label>
            <TooltipWrapper content="The estimated size of the development team.">
              Team Size
            </TooltipWrapper>
          </Label>
          <Input
            placeholder="e.g., 3 people"
            value={value.teamSize}
            onChange={(e) => handleChange("teamSize", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>
            <TooltipWrapper content="The estimated budget for development.">
              Development Budget
            </TooltipWrapper>
          </Label>
          <Input
            placeholder="e.g., $10,000"
            value={value.devBudget}
            onChange={(e) => handleChange("devBudget", e.target.value)}
          />
        </div>
        <div>
          <Label>
            <TooltipWrapper content="The estimated monthly budget for infrastructure.">
              Infrastructure Budget
            </TooltipWrapper>
          </Label>
          <Input
            placeholder="e.g., $200/month"
            value={value.infraBudget}
            onChange={(e) => handleChange("infraBudget", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
