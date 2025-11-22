/**
 * Cost Tracking for AI API Usage
 * 
 * Tracks costs for OpenRouter and Gemini API calls to monitor spending
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Estimated costs per token (in USD)
// These are approximate and should be updated based on actual pricing
const COST_ESTIMATES = {
  openrouter: {
    free: {
      'mistralai/mistral-7b-instruct:free': { input: 0, output: 0 }, // Free tier
      default: { input: 0.000001, output: 0.000002 }, // $0.001 per 1K input, $0.002 per 1K output
    },
    pro: {
      'anthropic/claude-3.5-sonnet': { input: 0.000003, output: 0.000015 }, // $3/$15 per 1M tokens
      default: { input: 0.000002, output: 0.000006 },
    },
  },
  gemini: {
    free: {
      'gemini-2.0-flash-exp': { input: 0, output: 0 }, // Free tier estimate
      default: { input: 0.00000025, output: 0.0000005 },
    },
    pro: {
      'gemini-1.5-pro': { input: 0.00000125, output: 0.000005 },
      default: { input: 0.000001, output: 0.000003 },
    },
  },
} as const;

// Cost tracking table schema (to be added to schema.ts)
// const costTracking = defineTable({
//   userId: v.string(),
//   provider: v.union(v.literal("openrouter"), v.literal("gemini")),
//   model: v.string(),
//   inputTokens: v.number(),
//   outputTokens: v.number(),
//   estimatedCost: v.number(), // in USD cents
//   timestamp: v.number(),
// })
// .index("by_userId", ["userId"])
// .index("by_timestamp", ["timestamp"]);

/**
 * Calculate estimated cost for an API call
 */
export function calculateCost(
  provider: 'openrouter' | 'gemini',
  userTier: 'free' | 'pro',
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const estimates = COST_ESTIMATES[provider][userTier];
  const modelEstimates = estimates[model as keyof typeof estimates] || estimates.default;
  
  const inputCost = inputTokens * modelEstimates.input;
  const outputCost = outputTokens * modelEstimates.output;
  
  return (inputCost + outputCost) * 100; // Convert to cents
}

/**
 * Track API cost (mutation)
 */
export const trackApiCost = mutation({
  args: {
    userId: v.string(),
    provider: v.union(v.literal("openrouter"), v.literal("gemini")),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    estimatedCost: v.number(), // in USD cents
  },
  handler: async (ctx, args) => {
    // For now, log to security events (cost tracking table can be added later)
    await ctx.db.insert("securityEvents", {
      type: "api_cost_tracking",
      userId: args.userId,
      ip: "system",
      fingerprint: "cost_tracker",
      details: {
        provider: args.provider,
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        estimatedCost: args.estimatedCost,
      },
      severity: "low",
      timestamp: Date.now(),
    });
  },
});

/**
 * Get cost summary for a user (query)
 */
export const getCostSummary = query({
  args: {
    userId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, { userId, days = 30 }) => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const events = await ctx.db
      .query("securityEvents")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", cutoff))
      .collect();
    
    const costEvents = events.filter(
      e => e.type === "api_cost_tracking" && e.userId === userId
    );
    
    let totalCost = 0;
    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    
    for (const event of costEvents) {
      const details = event.details as any;
      if (details?.estimatedCost) {
        const cost = details.estimatedCost as number;
        totalCost += cost;
        
        const provider = details.provider || "unknown";
        byProvider[provider] = (byProvider[provider] || 0) + cost;
        
        const model = details.model || "unknown";
        byModel[model] = (byModel[model] || 0) + cost;
      }
    }
    
    return {
      totalCost, // in cents
      totalCostUSD: totalCost / 100,
      byProvider,
      byModel,
      eventCount: costEvents.length,
      periodDays: days,
    };
  },
});

