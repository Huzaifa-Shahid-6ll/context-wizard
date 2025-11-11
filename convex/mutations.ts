import { mutation } from "./_generated/server";
// remove unused api import
import { v, JSONValue } from "convex/values";

const DAILY_FREE_LIMIT = 5;

function startOfUtcDayTimestampMs(dateMs: number): number {
  const d = new Date(dateMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

export const createGeneration = mutation({
  args: {
    userId: v.string(),
    repoUrl: v.string(),
  },
  handler: async (ctx, { userId, repoUrl }) => {
    const now = Date.now();
    const todayKey = startOfUtcDayTimestampMs(now).toString();

    // Find user by clerkId == userId or by id? Our schema stores clerkId, email, etc.
    // Here we assume userId is the Convex users.clerkId
    const user = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", userId)).unique();
    if (!user) {
      throw new Error("User not found");
    }

    const lastReset = user.lastResetDate; // string key for date
    const shouldReset = lastReset !== todayKey;
    const generationsToday = shouldReset ? 0 : (user.generationsToday ?? 0);

    const isPro = user.isPro ?? false;
    if (!isPro && generationsToday >= DAILY_FREE_LIMIT) {
      throw new Error("Daily generation limit reached (free tier)");
    }

    // Update counters
    if (shouldReset) {
      await ctx.db.patch(user._id, { lastResetDate: todayKey, generationsToday: 1 });
    } else {
      await ctx.db.patch(user._id, { generationsToday: generationsToday + 1 });
    }

    // Insert generation with processing status
    const generationId = await ctx.db.insert("generations", {
      userId,
      repoUrl,
      repoName: "", // fill later after fetch
      techStack: [],
      files: [],
      status: "processing",
      createdAt: now,
    });

    return generationId;
  },
});

export const updateGeneration = mutation({
  args: {
    id: v.id("generations"),
    patch: v.object({
      status: v.optional(v.union(v.literal("processing"), v.literal("completed"), v.literal("failed"))),
      files: v.optional(v.array(v.object({ name: v.string(), content: v.string() }))),
      techStack: v.optional(v.array(v.string())),
      repoName: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const deleteGeneration = mutation({
  args: { id: v.id("generations"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const gen = await ctx.db.get(id);
    if (!gen) return;
    if (gen.userId !== userId) {
      throw new Error("Not authorized to delete this generation");
    }
    await ctx.db.delete(id);
  },
});

export const deletePrompt = mutation({
  args: { id: v.id("prompts"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const p = await ctx.db.get(id);
    if (!p) throw new Error("Not found");
    if (p.userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(id);
  },
});

export const insertPrompt = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("cursor-app"),
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("cursorrules"),
      v.literal("error-fix"),
      v.literal("generic"),
      v.literal("image"),
      v.literal("video")
    ),
    title: v.string(),
    content: v.string(),
    context: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    const id = await ctx.db.insert("prompts", {
      ...args,
      // ensure loosely-typed fields are treated as unknown JSON blobs
      context: args.context as unknown,
      metadata: args.metadata as unknown,
    });
    return id;
  },
});

export const insertPromptAnalysis = mutation({
  args: {
    userId: v.string(),
    originalPrompt: v.string(),
    score: v.number(),
    issues: v.array(v.string()),
    suggestions: v.array(v.string()),
    improvedPrompt: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    const id = await ctx.db.insert("promptAnalyses", args);
    return id;
  },
});

export const insertOutputPrediction = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    predictedOutput: v.any(),
    confidence: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("outputPredictions", {
      ...args,
      predictedOutput: args.predictedOutput as unknown,
    });
    return id;
  },
});

export const incrementUserPromptsCreatedToday = mutation({
  args: { clerkId: v.string(), delta: v.number() },
  handler: async (ctx, { clerkId, delta }): Promise<void> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) return;
    const current = user.promptsCreatedToday ?? 0;
    await ctx.db.patch(user._id, { promptsCreatedToday: current + delta });
  },
});

export const incrementPromptViews = mutation({
  args: { id: v.id("prompts") },
  handler: async (ctx, { id }): Promise<void> => {
    const p = await ctx.db.get(id);
    if (!p) throw new Error("Prompt not found");
    const metaBase: unknown = p.metadata ?? {};
    const meta = (metaBase && typeof metaBase === "object") ? (metaBase as Record<string, unknown>) : {};
    const currentViews = typeof meta.views === "number" ? meta.views : Number((meta.views as unknown) ?? 0);
    const views = (currentViews || 0) + 1;
    await ctx.db.patch(id, { metadata: { ...meta, views } as unknown });
  },
});

export const saveUserPreferences = mutation({
  args: { userId: v.string(), featureType: v.string(), formData: v.any(), preferredMode: v.optional(v.union(v.literal("quick"), v.literal("standard"), v.literal("advanced"))) },
  handler: async (ctx, { userId, featureType, formData, preferredMode }): Promise<string> => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const match = existing.find((p) => String((p as Record<string, unknown>).featureType) === featureType);
    const now = Date.now();
    if (match) {
      await ctx.db.patch(match._id, { savedInputs: formData as unknown, preferredMode: preferredMode ?? (match as any).preferredMode, updatedAt: now });
      return match._id;
    }
    const id = await ctx.db.insert("userPreferences", {
      userId,
      featureType,
      savedInputs: formData as unknown,
      autoFillEnabled: true,
      preferredMode: preferredMode ?? "quick",
      customTemplates: [],
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

// Prompt Templates CRUD
export const savePromptTemplate = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("generic"),
      v.literal("image"),
      v.literal("video"),
      v.literal("cursor-app"),
      v.literal("analysis")
    ),
    template: v.string(),
    variables: v.array(v.string()),
    isPublic: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<string> => {
    const now = Date.now();
    const id = await ctx.db.insert("promptTemplates", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      category: args.category,
      template: args.template,
      variables: args.variables,
      metadata: args.metadata as unknown,
      isPublic: !!args.isPublic,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updatePromptTemplate = mutation({
  args: {
    id: v.id("promptTemplates"),
    patch: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      template: v.optional(v.string()),
      variables: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { id, patch }): Promise<void> => {
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const deletePromptTemplate = mutation({
  args: { id: v.id("promptTemplates"), userId: v.string() },
  handler: async (ctx, { id, userId }): Promise<void> => {
    const tpl = await ctx.db.get(id);
    if (!tpl) return;
    if ((tpl as unknown as { userId?: string }).userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(id);
  },
});


// Stripe subscription sync mutations
export const updateUserSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    priceId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();
    if (!user) throw new Error("User not found");

    // Entitlement policy: treat active, trialing, and past_due as pro until cancellation
    const proStatuses = ["active", "trialing", "past_due"] as const;
    const isPro = (proStatuses as readonly string[]).includes(args.status);

    await ctx.db.patch(user._id, {
      stripeSubscriptionId: args.subscriptionId,
      stripeCustomerId: args.customerId,
      stripePriceId: args.priceId,
      subscriptionStatus: args.status,
      subscriptionCurrentPeriodEnd: args.currentPeriodEnd,
      subscriptionCancelAtPeriodEnd: args.cancelAtPeriodEnd,
      isPro,
    });
  },
});

export const cancelUserSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<void> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      stripeSubscriptionId: undefined,
      stripeCustomerId: undefined,
      stripePriceId: undefined,
      subscriptionStatus: "canceled",
      subscriptionCurrentPeriodEnd: undefined,
      subscriptionCancelAtPeriodEnd: undefined,
      isPro: false,
    });
  },
});



// Webhook logging mutation
export const logWebhookEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    status: v.union(v.literal("success"), v.literal("failed"), v.literal("retrying")),
    userId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    retryCount: v.number(),
    requestId: v.optional(v.string()),
    processingTimeMs: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<void> => {
    // Check if event already logged (prevent duplicates)
    const existing = await ctx.db
      .query("webhookLogs")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (existing) {
      // Update existing log
      await ctx.db.patch(existing._id, {
        status: args.status,
        errorMessage: args.errorMessage,
        retryCount: args.retryCount,
        processingTimeMs: args.processingTimeMs,
        processedAt: Date.now(),
      });
    } else {
      // Create new log
      await ctx.db.insert("webhookLogs", {
        eventId: args.eventId,
        eventType: args.eventType,
        status: args.status,
        userId: args.userId,
        errorMessage: args.errorMessage,
        processedAt: Date.now(),
        retryCount: args.retryCount,
        requestId: args.requestId,
        processingTimeMs: args.processingTimeMs,
      });
    }
  },
});

