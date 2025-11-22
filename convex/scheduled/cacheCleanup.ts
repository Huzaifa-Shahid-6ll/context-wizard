/**
 * Scheduled function to cleanup expired cache entries
 * 
 * Runs periodically to remove expired cache entries from the database
 */

import { internalMutation } from "../_generated/server";
import { api } from "../_generated/api";

export const cleanupExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expired = await ctx.db
      .query("cache")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect();
    
    let deleted = 0;
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
      deleted++;
    }
    
    return { deleted, total: expired.length };
  },
});

