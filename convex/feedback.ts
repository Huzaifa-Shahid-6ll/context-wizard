import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitFeedback = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    type: v.string(),
    message: v.string(),
    rating: v.optional(v.number()),
    page: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate message length
    if (!args.message || typeof args.message !== 'string') {
      throw new Error("INVALID_INPUT: Feedback message is required");
    }
    if (args.message.trim().length < 10) {
      throw new Error("INVALID_INPUT: Feedback must be at least 10 characters");
    }
    if (args.message.length > 5000) {
      throw new Error("INVALID_INPUT: Feedback cannot exceed 5000 characters");
    }
    
    // Validate email if provided
    if (args.email && typeof args.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(args.email)) {
        throw new Error("INVALID_INPUT: Invalid email format");
      }
      if (args.email.length > 255) {
        throw new Error("INVALID_INPUT: Email is too long");
      }
    }

    const feedbackId = await ctx.db.insert("feedback", {
      userId: args.userId,
      email: args.email,
      type: args.type,
      message: args.message,
      rating: args.rating,
      page: args.page,
      userAgent: args.userAgent,
      resolved: false,
      createdAt: Date.now(),
    });

    return { success: true, id: feedbackId };
  },
});

export const listFeedback = query({
  args: {
    resolved: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { resolved, limit = 50 }) => {
    if (resolved !== undefined) {
      return await ctx.db
        .query("feedback")
        .withIndex("by_resolved", (q) => q.eq("resolved", resolved))
        .order("desc")
        .take(limit);
    } else {
      return await ctx.db
        .query("feedback")
        .order("desc")
        .take(limit);
    }
  },
});

export const resolveFeedback = mutation({
  args: {
    feedbackId: v.id("feedback"),
    notes: v.optional(v.string()),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId, {
      resolved: true,
      resolvedAt: Date.now(),
      resolvedBy: args.resolvedBy,
      notes: args.notes,
    });

    return { success: true };
  },
});