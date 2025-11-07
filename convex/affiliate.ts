import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logClick = mutation({
  args: {
    toolName: v.string(),
    category: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a record in the affiliateClicks table
    await ctx.db.insert("affiliateClicks", {
      userId: args.userId || undefined, // Convert null to undefined for the database
      toolName: args.toolName,
      category: args.category,
      clickedAt: Date.now(),
    });
  },
});