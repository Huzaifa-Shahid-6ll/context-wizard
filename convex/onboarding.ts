import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveOnboarding = mutation({
  args: {
    userId: v.string(),
    role: v.string(),
    tools: v.array(v.string()),
    painPoint: v.string(),
    projectTypes: v.array(v.string()),
    techFamiliarity: v.string(),
    goal: v.string(),
    source: v.string(),
    sourceDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save onboarding responses
    await ctx.db.insert("onboardingResponses", {
      ...args,
      completedAt: Date.now(),
    });
    
    // Mark user as onboarded
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        onboardingCompleted: true,
      });
    }

    return { success: true };
  },
});

export const getOnboardingData = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("onboardingResponses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getOnboardingStats = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db
      .query("onboardingResponses")
      .collect();
      
    // Calculate stats
    const roleBreakdown = responses.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const painPointBreakdown = responses.reduce((acc, r) => {
      acc[r.painPoint] = (acc[r.painPoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const toolsBreakdown = responses.reduce((acc, r) => {
      r.tools.forEach(tool => {
        acc[tool] = (acc[tool] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResponses: responses.length,
      roleBreakdown,
      painPointBreakdown,
      toolsBreakdown,
    };
  },
});

export const resetOnboarding = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (user) {
      // Remove the onboardingCompleted flag
      await ctx.db.patch(user._id, {
        onboardingCompleted: undefined,
      });
    }

    return { success: true };
  },
});