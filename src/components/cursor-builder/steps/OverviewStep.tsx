"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TooltipWrapper } from "@/components/forms/TooltipWrapper";
import type { CursorBuilderFormState } from "@/types/cursor-builder";
import type { StepProps } from "./StepProps";

interface OverviewStepProps extends StepProps {
  // Additional props specific to overview step if needed
}

export function OverviewStep({ formState, updateField }: OverviewStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold tracking-tight">Project Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="projectName">
            <TooltipWrapper content="What is your project called? This will be used in documentation and prompts." glossaryTerm="Project Name">Project Name</TooltipWrapper>
          </Label>
          <Input 
            id="projectName" 
            value={formState.projectName} 
            onChange={(e) => updateField("projectName", e.target.value)} 
            placeholder="Acme CRM" 
            required 
          />
        </div>
        <div>
          <Label htmlFor="projectType">
            <TooltipWrapper content="What kind of app are you building?" glossaryTerm="Project Type">Project Type</TooltipWrapper>
          </Label>
          <select 
            id="projectType" 
            aria-label="Select Project Type"
            className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:ring-2 ring-primary" 
            value={formState.projectType} 
            onChange={(e) => updateField("projectType", e.target.value)} 
            required
          >
            { ["web app","mobile app","API","desktop app","library","cli"].map((t) => <option key={t}>{t}</option>) }
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="oneSentence">
          <TooltipWrapper content="One short sentence describing the core purpose of your app." glossaryTerm="One-liner">One-sentence description</TooltipWrapper>
        </Label>
        <Input 
          id="oneSentence"
          className="mt-2" 
          maxLength={100} 
          value={formState.oneSentence} 
          onChange={(e) => updateField("oneSentence", e.target.value)} 
          placeholder="Describe the core purpose in one sentence" 
          required 
        />
      </div>
      <div>
        <Label htmlFor="projectDescription">
          <TooltipWrapper content="A detailed description of what you're building, who it's for, and how it will be used. This helps us understand your project's purpose and goals.">
            Overview / Main Purpose
          </TooltipWrapper>
        </Label>
        <Textarea 
          id="projectDescription"
          className="mt-2" 
          rows={4} 
          value={formState.projectDescription} 
          onChange={(e) => updateField("projectDescription", e.target.value)} 
          placeholder="What are you building? Who is it for? Key workflows?" 
          required 
        />
        <p className="text-xs text-foreground/60 mt-1">
          💡 Tip: Describe your app's purpose, target users, and main features. The more detail, the better we can help you.
        </p>
      </div>
      <div>
        <Label htmlFor="isNewApp">
          <TooltipWrapper content="Whether you're starting fresh, improving an existing app, or creating a prototype to test ideas.">
            Is this a new app, enhancement, or prototype?
          </TooltipWrapper>
        </Label>
        <select 
          id="isNewApp" 
          aria-label="Is this a new app, enhancement, or prototype?"
          className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm" 
          value={formState.isNewApp} 
          onChange={(e) => updateField("isNewApp", e.target.value as "new" | "enhancement" | "prototype")} 
          required
        >
          <option value="new">New app from scratch</option>
          <option value="enhancement">Enhancement to existing app</option>
          <option value="prototype">Prototype</option>
        </select>
        <p className="text-xs text-foreground/60 mt-1">
          💡 Tip: New = starting from nothing. Enhancement = adding to existing app. Prototype = testing ideas before full build.
        </p>
      </div>
      <div>
        <Label htmlFor="githubUrl">
          <TooltipWrapper content="If you already have code in a GitHub repository, share the link so we can analyze it and auto-fill relevant information.">
            Existing GitHub Repository URL (optional)
          </TooltipWrapper>
        </Label>
        <Input 
          id="githubUrl" 
          className="mt-2" 
          value={formState.githubUrl} 
          onChange={(e) => updateField("githubUrl", e.target.value)} 
          placeholder="https://github.com/username/repo" 
        />
        <p className="text-xs text-foreground/60 mt-1">We'll analyze it for auto-population</p>
      </div>
      <div>
        <Label htmlFor="timeline">
          <TooltipWrapper content="When you want to complete different phases of your project. This helps plan the development process.">
            Desired Timeline
          </TooltipWrapper>
        </Label>
        <Input 
          id="timeline" 
          className="mt-2" 
          value={formState.timeline} 
          onChange={(e) => updateField("timeline", e.target.value)} 
          placeholder="e.g., MVP in 2 weeks, full launch in 3 months" 
          required 
        />
        <p className="text-xs text-foreground/60 mt-1">
          💡 Tip: Be realistic about timelines. Consider MVP (minimum viable product) first, then full launch.
        </p>
      </div>
      <div>
        <Label htmlFor="budget">
          <TooltipWrapper content="Your available resources, team size, or budget constraints. This helps determine what's feasible for your project.">
            Budget or Resource Constraints
          </TooltipWrapper>
        </Label>
        <Input 
          id="budget" 
          className="mt-2" 
          value={formState.budget} 
          onChange={(e) => updateField("budget", e.target.value)} 
          placeholder="e.g., solo developer, small team, specific tools, or budget range" 
          required 
        />
        <p className="text-xs text-foreground/60 mt-1">
          💡 Tip: Describe your team size, budget, or any constraints (like specific tools you must use).
        </p>
      </div>
      <div>
        <Label htmlFor="competitors">
          <TooltipWrapper content="Apps or services similar to what you're building. This helps us understand the market and what makes your app unique.">
            Similar Apps or Competitors
          </TooltipWrapper>
        </Label>
        <Textarea 
          id="competitors" 
          className="mt-2" 
          rows={3} 
          value={formState.competitors} 
          onChange={(e) => updateField("competitors", e.target.value)} 
          placeholder="List them and what you'd like to differentiate (e.g., 'Like Strava but with AI coaching')" 
          required 
        />
        <p className="text-xs text-foreground/60 mt-1">
          💡 Tip: Mention similar apps and explain how yours will be different or better. This helps define your unique value.
        </p>
      </div>
      <div>
        <Label htmlFor="uploadedDocuments">
          <TooltipWrapper content="Upload any design files, wireframes, mockups, or inspiration images that show what you want your app to look like. These help us understand your vision.">
            Upload Documents, Design Inspirations, Wireframes, or Mockups
          </TooltipWrapper>
        </Label>
        <Input 
          id="uploadedDocuments"
          type="file" 
          className="mt-2" 
          multiple 
          accept=".pdf,.png,.jpg,.jpeg,.fig,.sketch,.doc,.docx"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            updateField("uploadedDocuments", files as unknown as File[]);
          }}
        />
        <p className="text-xs text-foreground/60 mt-1">Supports PDF, images, Figma links, wireframes, mockups</p>
      </div>
    </div>
  );
}

