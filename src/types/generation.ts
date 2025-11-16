import type { Id } from "../convex/_generated/dataModel";

export type GenerationId = Id<"appBuilderGenerations">;

export type GenerationStatus = 
  | "prd_pending"
  | "prd_approved"
  | "user_flows_pending"
  | "user_flows_approved"
  | "tasks_pending"
  | "tasks_approved"
  | "lists_pending"
  | "lists_approved"
  | "prompts_pending"
  | "prompts_approved"
  | "completed"
  | "cancelled";

export type GenerationStep = 
  | "form" 
  | "prd" 
  | "user_flows" 
  | "tasks" 
  | "lists" 
  | "prompts" 
  | "summary";

export type GeneratedItem = { 
  title: string; 
  prompt: string; 
  order: number 
};

export type GenerationResult = {
  projectRequirements: string;
  frontendPrompts: GeneratedItem[];
  backendPrompts: GeneratedItem[];
  cursorRules: string;
  errorFixPrompts: { error: string; fix: string }[];
  estimatedComplexity?: string;
};

export type GeneratedLists = {
  frontend: Array<{ name: string; type: string }>;
  backend: Array<{ name: string; type: string }>;
  security: Array<{ name: string; type: string }>;
  functionality: Array<{ name: string; type: string }>;
  errorFixing: Array<{ name: string; type: string }>;
};

export type GeneratedPrompts = {
  frontend?: GeneratedItem[];
  backend?: GeneratedItem[];
  security?: GeneratedItem[];
  functionality?: GeneratedItem[];
  error_fixing?: GeneratedItem[];
};

export type CurrentPromptIndex = {
  type: string;
  name: string;
  index: number;
} | null;

