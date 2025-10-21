import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGeneration = query({
  args: { id: v.id("generations") },
  handler: async (ctx, { id }) => {
    const generation = await ctx.db.get(id);
    return generation;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    return user;
  },
});

export const listGenerationsByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const items = await ctx.db
      .query("generations")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .order("desc")
      .collect();
    return (limit ? items.slice(0, limit) : items);
  },
});

// Prompts
export const listPromptsByUser = query({
  args: {
    userId: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, type, limit }): Promise<Array<any>> => {
    const items = await ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    const filtered = type ? items.filter(i => (i as any).type === type) : items;
    const sorted = filtered.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
    return limit ? sorted.slice(0, limit) : sorted;
  },
});

export const getPrompt = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, { id }) => {
    const prompt = await ctx.db.get(id);
    if (!prompt) throw new Error("Prompt not found");
    return prompt;
  },
});

// Prompt Analyses
export const listAnalysesByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }): Promise<Array<any>> => {
    const items = await ctx.db
      .query("promptAnalyses")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const sorted = items.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
    return limit ? sorted.slice(0, limit) : sorted;
  },
});

// Output Predictions
export const listPredictionsByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }): Promise<Array<any>> => {
    const items = await ctx.db
      .query("outputPredictions")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const sorted = items.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
    return limit ? sorted.slice(0, limit) : sorted;
  },
});

// Prompt Stats
type PromptStats = {
  totalsByType: Record<string, number>;
  averageAnalysisScore: number;
  mostUsedFeatures: string[];
  successMetrics: { highQualityCount: number; highQualityRate: number };
};

export const getPromptStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<PromptStats> => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    const analyses = await ctx.db
      .query("promptAnalyses")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    // Totals by type
    const totalsByType: Record<string, number> = {};
    for (const p of prompts as Array<{ type?: string }>) {
      const t = (p as any).type || "unknown";
      totalsByType[t] = (totalsByType[t] ?? 0) + 1;
    }

    // Average analysis score
    const scores = (analyses as Array<{ score?: number }>).map(a => Number((a as any).score) || 0);
    const averageAnalysisScore = scores.length ? (scores.reduce((s, n) => s + n, 0) / scores.length) : 0;

    // Most used features (using metadata.section if present)
    const sectionCounts: Record<string, number> = {};
    for (const p of prompts as Array<{ metadata?: any }>) {
      const section = (p as any).metadata?.section;
      if (typeof section === "string" && section.length) {
        sectionCounts[section] = (sectionCounts[section] ?? 0) + 1;
      }
    }
    const mostUsedFeatures = Object.entries(sectionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Success metrics: high quality analyses (score >= 80)
    const highQualityCount = scores.filter(s => s >= 80).length;
    const highQualityRate = scores.length ? (highQualityCount / scores.length) : 0;

    return {
      totalsByType,
      averageAnalysisScore,
      mostUsedFeatures,
      successMetrics: { highQualityCount, highQualityRate },
    };
  },
});


