import type { Id } from "@/../convex/_generated/dataModel";

export type UserStats = {
  remainingPrompts: number;
  isPro: boolean;
};

export type GenerationProgress = {
  status: string;
  currentStep: string;
  progress: number;
  generatedPrompts?: Record<string, unknown>;
};

export type ChatSessionId = Id<"chatSessions">;

