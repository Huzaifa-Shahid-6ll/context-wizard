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
    clerkId: v.optional(v.string()), // Add clerkId for authorization check
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()), // Pagination cursor
  },
  handler: async (ctx, { userId, clerkId, type, limit = 50, cursor }): Promise<{
    items: Array<Record<string, unknown>>;
    nextCursor: string | null;
    hasMore: boolean;
  }> => {
    // Authorization check: userId must match clerkId (if provided)
    if (clerkId && userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access these prompts");
    }

    // Validate limit (max 100 items per page)
    const pageLimit = Math.min(limit || 50, 100);

    let query = ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId));

    // If cursor provided, start from that point
    if (cursor) {
      try {
        const cursorTimestamp = parseInt(cursor, 10);
        query = query.filter(q => q.lt(q.field("createdAt"), cursorTimestamp));
      } catch {
        // Invalid cursor, ignore it
      }
    }

    const items = await query
      .order("desc")
      .take(pageLimit + 1); // Fetch one extra to check if there's more

    // Additional verification: ensure all items belong to the user
    const userItems = items.filter(i => (i as Record<string, unknown>).userId === userId);

    const filtered = type 
      ? userItems.filter(i => (i as Record<string, unknown>).type === type) 
      : userItems;

    const sorted = filtered.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });

    const hasMore = sorted.length > pageLimit;
    const paginatedItems = sorted.slice(0, pageLimit);
    const nextCursor = hasMore && paginatedItems.length > 0
      ? String((paginatedItems[paginatedItems.length - 1] as Record<string, unknown>).createdAt)
      : null;

    return {
      items: paginatedItems,
      nextCursor,
      hasMore,
    };
  },
});

export const getPrompt = query({
  args: { id: v.id("prompts"), clerkId: v.string() },
  handler: async (ctx, { id, clerkId }) => {
    const prompt = await ctx.db.get(id);
    if (!prompt) {
      throw new Error("RESOURCE_NOT_FOUND: Prompt not found");
    }
    // Verify user owns this prompt
    if (prompt.userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access this prompt");
    }
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
  args: { 
    userId: v.string(), 
    clerkId: v.optional(v.string()), 
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { userId, clerkId, limit = 50, cursor }): Promise<{
    items: Array<Record<string, unknown>>;
    nextCursor: string | null;
    hasMore: boolean;
  }> => {
    // Authorization check: userId must match clerkId (if provided)
    if (clerkId && userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access these analyses");
    }

    const pageLimit = Math.min(limit || 50, 100);

    let query = ctx.db
      .query("promptAnalyses")
      .withIndex("by_userId", q => q.eq("userId", userId));

    if (cursor) {
      try {
        const cursorTimestamp = parseInt(cursor, 10);
        query = query.filter(q => q.lt(q.field("createdAt"), cursorTimestamp));
      } catch {
        // Invalid cursor, ignore it
      }
    }

    const items = await query
      .order("desc")
      .take(pageLimit + 1);
    
    const userItems = items.filter(i => (i as Record<string, unknown>).userId === userId);
    
    const sorted = userItems.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });

    const hasMore = sorted.length > pageLimit;
    const paginatedItems = sorted.slice(0, pageLimit);
    const nextCursor = hasMore && paginatedItems.length > 0
      ? String((paginatedItems[paginatedItems.length - 1] as Record<string, unknown>).createdAt)
      : null;

    return {
      items: paginatedItems,
      nextCursor,
      hasMore,
    };
  },
});

// Output Predictions
export const listPredictionsByUser = query({
  args: { 
    userId: v.string(), 
    clerkId: v.optional(v.string()), 
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { userId, clerkId, limit = 50, cursor }): Promise<{
    items: Array<Record<string, unknown>>;
    nextCursor: string | null;
    hasMore: boolean;
  }> => {
    // Authorization check: userId must match clerkId (if provided)
    if (clerkId && userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access these predictions");
    }

    const pageLimit = Math.min(limit || 50, 100);

    let query = ctx.db
      .query("outputPredictions")
      .withIndex("by_userId", q => q.eq("userId", userId));

    if (cursor) {
      try {
        const cursorTimestamp = parseInt(cursor, 10);
        query = query.filter(q => q.lt(q.field("createdAt"), cursorTimestamp));
      } catch {
        // Invalid cursor, ignore it
      }
    }

    const items = await query
      .order("desc")
      .take(pageLimit + 1);
    
    const userItems = items.filter(i => (i as Record<string, unknown>).userId === userId);
    
    const sorted = userItems.sort((a, b) => {
      const bCreatedAt = (b as Record<string, unknown>).createdAt as number;
      const aCreatedAt = (a as Record<string, unknown>).createdAt as number;
      return bCreatedAt - aCreatedAt;
    });

    const hasMore = sorted.length > pageLimit;
    const paginatedItems = sorted.slice(0, pageLimit);
    const nextCursor = hasMore && paginatedItems.length > 0
      ? String((paginatedItems[paginatedItems.length - 1] as Record<string, unknown>).createdAt)
      : null;

    return {
      items: paginatedItems,
      nextCursor,
      hasMore,
    };
  },
});

// Prompt Stats
type PromptStats = {
  totalsByType: Record<string, number>;
  averageAnalysisScore: number;
  mostUsedFeatures: string[];
  featureUsageCounts: Record<string, number>;
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
    
    // Feature usage counts (top 5)
    const featureUsageCounts: Record<string, number> = {};
    Object.entries(sectionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([name, count]) => {
        featureUsageCounts[name] = count;
      });

    // Success metrics: high quality analyses (score >= 80)
    const highQualityCount = scores.filter(s => s >= 80).length;
    const highQualityRate = scores.length ? (highQualityCount / scores.length) : 0;

    return {
      totalsByType,
      averageAnalysisScore,
      mostUsedFeatures,
      featureUsageCounts,
      successMetrics: { highQualityCount, highQualityRate },
    };
  },
});

// Time-series data for prompt usage over time
export const getPromptTimeSeries = query({
  args: { userId: v.string(), clerkId: v.optional(v.string()), days: v.optional(v.number()) },
  handler: async (ctx, { userId, clerkId, days = 30 }): Promise<Array<{ date: string; count: number }>> => {
    // Authorization check: userId must match clerkId (if provided)
    if (clerkId && userId !== clerkId) {
      throw new Error("UNAUTHORIZED: Not authorized to access this time series data");
    }
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    // Calculate date range (last N days)
    const now = Date.now();
    const startDate = now - (days * 24 * 60 * 60 * 1000);
    
    // Filter prompts within date range
    const recentPrompts = prompts.filter((p) => {
      const createdAt = (p as Record<string, unknown>).createdAt as number;
      return createdAt >= startDate;
    });

    // Group by date (YYYY-MM-DD format)
    const dateCounts: Record<string, number> = {};
    for (const p of recentPrompts) {
      const createdAt = (p as Record<string, unknown>).createdAt as number;
      const date = new Date(createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    }

    // Generate array for all days in range (including days with 0 prompts)
    const result: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: dateCounts[dateKey] || 0,
      });
    }

    return result;
  },
});


