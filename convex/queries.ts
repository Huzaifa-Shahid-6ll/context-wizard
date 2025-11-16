import { query } from "./_generated/server";
import { v } from "convex/values";

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

// Prompts
export const listPromptsByUser = query({
  args: {
    userId: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, type, limit }): Promise<Array<Record<string, unknown>>> => {
    const items = await ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    const filtered = type ? items.filter(i => (i as Record<string, unknown>).type === type) : items;
    const sorted = filtered.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });
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

// User Preferences
export const getUserPreferences = query({
  args: { userId: v.string(), featureType: v.string() },
  handler: async (ctx, { userId, featureType }) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    // choose most recent matching featureType
    const forFeature = prefs.filter((p) => String((p as Record<string, unknown>).featureType) === featureType);
    if (!forFeature.length) return null as unknown as null;
    forFeature.sort((a, b) => (b as { updatedAt?: number }).updatedAt! - (a as { updatedAt?: number }).updatedAt!);
    return forFeature[0];
  },
});

// Prompt Templates
export const listPromptTemplates = query({
  args: { userId: v.string(), includePublic: v.optional(v.boolean()), category: v.optional(v.string()) },
  handler: async (ctx, { userId, includePublic, category }) => {
    const own = await ctx.db
      .query("promptTemplates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let combined = own;
    if (includePublic) {
      const pub = await ctx.db.query("promptTemplates").withIndex("by_isPublic", (q) => q.eq("isPublic", true)).collect();
      const map = new Map(own.map((t) => [String((t as Record<string, unknown>)._id), true]));
      for (const p of pub) {
        if (!map.has(String((p as Record<string, unknown>)._id))) combined.push(p);
      }
    }
    if (category) {
      combined = combined.filter((t) => String((t as Record<string, unknown>).category) === category);
    }
    combined.sort((a, b) => (b as { updatedAt?: number }).updatedAt! - (a as { updatedAt?: number }).updatedAt!);
    return combined;
  },
});

// Prompt Analyses
export const listAnalysesByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }): Promise<Array<Record<string, unknown>>> => {
    const items = await ctx.db
      .query("promptAnalyses")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const sorted = items.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });
    return limit ? sorted.slice(0, limit) : sorted;
  },
});

// Output Predictions
export const listPredictionsByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }): Promise<Array<Record<string, unknown>>> => {
    const items = await ctx.db
      .query("outputPredictions")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const sorted = items.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });
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
      const t = String((p as Record<string, unknown>).type || "unknown");
      totalsByType[t] = (totalsByType[t] ?? 0) + 1;
    }

    // Average analysis score
    const scores = (analyses as Array<{ score?: number }>).map(a => Number((a as Record<string, unknown>).score) || 0);
    const averageAnalysisScore = scores.length ? (scores.reduce((s, n) => s + n, 0) / scores.length) : 0;

    // Most used features (using metadata.section if present)
    const sectionCounts: Record<string, number> = {};
    for (const p of prompts as Array<{ metadata?: Record<string, unknown> }>) {
      const metadata = (p as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
      const section = metadata?.section;
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


