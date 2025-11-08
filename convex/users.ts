import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export type UserDoc = import("./_generated/dataModel").Doc<"users">;

type CheckGenerationLimitResult = {
  canGenerate: boolean;
  remaining: number; // use large number for pro users
};

type CheckPromptLimitResult = {
  canCreate: boolean;
  remaining: number; // use large number for pro users
};

type UserStats = {
  totalGenerations: number;
  generationsToday: number;
  remaining: number;
  isPro: boolean;
  // Prompt metrics
  totalPrompts: number;
  promptsToday: number;
  remainingPrompts: number;
  promptTypeBreakdown: Record<string, number>;
  promptsTodayByType: Record<string, number>;
  // Subscription fields
  nextBillingDate?: number;
  amount?: number;
  paymentMethodLast4?: string;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodEnd?: number;
};

const DAILY_FREE_LIMIT = 5;

function startOfUtcDayTimestampMs(dateMs: number): number {
  const d = new Date(dateMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

function todayKey(): string {
  return String(startOfUtcDayTimestampMs(Date.now()));
}

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }): Promise<UserDoc> => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", clerkId))
      .unique();

    if (existing) return existing;

    const now = Date.now();
    const newId = await ctx.db.insert("users", {
      clerkId,
      email,
      generationsToday: 0,
      lastResetDate: String(startOfUtcDayTimestampMs(now)),
      isPro: false,
      createdAt: now,
      // Prompt counters
      promptsCreatedToday: 0,
      lastPromptResetDate: String(startOfUtcDayTimestampMs(now)),
    });

    const created = await ctx.db.get(newId);
    if (!created) throw new Error("Failed to create user");
    return created;
  },
});

export const checkGenerationLimit = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<CheckGenerationLimitResult> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    const key = todayKey();
    let generationsToday = user.generationsToday ?? 0;
    if (user.lastResetDate !== key) {
      generationsToday = 0;
      await ctx.db.patch(user._id, { generationsToday, lastResetDate: key });
    }

    const isPro = user.isPro ?? false;
    if (isPro) {
      return { canGenerate: true, remaining: Number.MAX_SAFE_INTEGER };
    }

    const remaining = Math.max(0, DAILY_FREE_LIMIT - generationsToday);
    return { canGenerate: remaining > 0, remaining };
  },
});

export const incrementGenerationCount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<void> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    const key = todayKey();
    const shouldReset = user.lastResetDate !== key;
    const nextCount = (shouldReset ? 0 : (user.generationsToday ?? 0)) + 1;
    await ctx.db.patch(user._id, {
      generationsToday: nextCount,
      lastResetDate: key,
    });
  },
});

// Prompt limit: free 20/day; pro unlimited. Resets daily similar to generations
const DAILY_FREE_PROMPT_LIMIT = 20;

export const checkPromptLimit = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<CheckPromptLimitResult> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    const key = todayKey();
    let promptsToday = user.promptsCreatedToday ?? 0;
    if (user.lastPromptResetDate !== key) {
      promptsToday = 0;
      await ctx.db.patch(user._id, { promptsCreatedToday: promptsToday, lastPromptResetDate: key });
    }

    const isPro = user.isPro ?? false;
    if (isPro) {
      return { canCreate: true, remaining: Number.MAX_SAFE_INTEGER };
    }

    const remaining = Math.max(0, DAILY_FREE_PROMPT_LIMIT - promptsToday);
    return { canCreate: remaining > 0, remaining };
  },
});

export const incrementPromptCount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<void> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    const key = todayKey();
    const shouldReset = user.lastPromptResetDate !== key;
    const nextCount = (shouldReset ? 0 : (user.promptsCreatedToday ?? 0)) + 1;
    await ctx.db.patch(user._id, {
      promptsCreatedToday: nextCount,
      lastPromptResetDate: key,
    });
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<UserStats> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", userId))
      .unique();
    if (!user) {
      // Return safe defaults if user record doesn't exist yet.
      return {
        totalGenerations: 0,
        generationsToday: 0,
        remaining: DAILY_FREE_LIMIT,
        isPro: false,
        totalPrompts: 0,
        promptsToday: 0,
        remainingPrompts: 20,
        promptTypeBreakdown: {},
        promptsTodayByType: {},
        nextBillingDate: undefined,
        amount: undefined,
        paymentMethodLast4: undefined,
        subscriptionCancelAtPeriodEnd: undefined,
        subscriptionCurrentPeriodEnd: undefined,
      };
    }

    // Count total generations for this user
    const gens = await ctx.db
      .query("generations")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const totalGenerations = gens.length;

    // Compute today's count (without mutating)
    const key = todayKey();
    const generationsToday = user.lastResetDate === key ? (user.generationsToday ?? 0) : 0;
    const isPro = user.isPro ?? false;
    const remaining = isPro ? Number.MAX_SAFE_INTEGER : Math.max(0, DAILY_FREE_LIMIT - generationsToday);

    // Prompt stats
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    const totalPrompts = prompts.length;
    const promptKey = todayKey();
    const promptsToday = user.lastPromptResetDate === promptKey ? (user.promptsCreatedToday ?? 0) : 0;
    const remainingPrompts = isPro ? Number.MAX_SAFE_INTEGER : Math.max(0, DAILY_FREE_PROMPT_LIMIT - promptsToday);

    // Today's prompts by type
    const startToday = startOfUtcDayTimestampMs(Date.now());
    const promptsTodayByType: Record<string, number> = {};
    for (const p of prompts) {
      if (typeof p.createdAt === "number" && p.createdAt >= startToday) {
        const t = p.type || "unknown";
        promptsTodayByType[t] = (promptsTodayByType[t] ?? 0) + 1;
      }
    }

    const promptTypeBreakdown: Record<string, number> = {};
    for (const p of prompts) {
      const t = p.type || "unknown";
      promptTypeBreakdown[t] = (promptTypeBreakdown[t] ?? 0) + 1;
    }

    return {
      totalGenerations,
      generationsToday,
      remaining,
      isPro,
      totalPrompts,
      promptsToday,
      remainingPrompts,
      promptTypeBreakdown,
      promptsTodayByType,
      // Subscription fields
      nextBillingDate: user.subscriptionCurrentPeriodEnd,
      amount: undefined, // Amount would need to be fetched from Stripe or stored
      paymentMethodLast4: undefined, // Payment method info would need to be fetched from Stripe
      subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    };
  },
});


