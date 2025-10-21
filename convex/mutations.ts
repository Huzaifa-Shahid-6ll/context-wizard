import { mutation } from "./_generated/server";
// remove unused api import
import { v } from "convex/values";

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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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
      predictedOutput: args.predictedOutput as any,
    });
    return id;
  },
});

export const incrementUserPromptsCreatedToday = mutation({
  args: { clerkId: v.string(), delta: v.number() },
  handler: async (ctx, { clerkId, delta }) => {
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
  handler: async (ctx, { id }) => {
    const p = await ctx.db.get(id);
    if (!p) throw new Error("Prompt not found");
    const metaBase: unknown = p.metadata ?? {};
    const meta = (metaBase && typeof metaBase === "object") ? (metaBase as Record<string, unknown>) : {};
    const currentViews = typeof meta.views === "number" ? meta.views : Number((meta.views as unknown) ?? 0);
    const views = (currentViews || 0) + 1;
    await ctx.db.patch(id, { metadata: { ...meta, views } as unknown });
  },
});


