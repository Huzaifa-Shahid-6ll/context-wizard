/**
 * Scheduled function to cleanup expired rate limit entries
 * 
 * Runs periodically to remove expired rate limit records from the database
 */

import { internalMutation } from "../_generated/server";

export const cleanupExpiredRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_resetAt", (q) => q.lt("resetAt", now))
      .collect();
    
    let deleted = 0;
    for (const record of expired) {
      await ctx.db.delete(record._id);
      deleted++;
    }
    
    return { deleted, total: expired.length };
  },
});

