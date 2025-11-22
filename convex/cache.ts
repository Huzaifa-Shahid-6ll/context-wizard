/**
 * Cache operations for Convex
 * 
 * Provides caching functionality using Convex database
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get cached value
 */
export const getCacheValue = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const now = Date.now();
    
    const cacheEntry = await ctx.db
      .query("cache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (!cacheEntry) {
      return null;
    }
    
    // Check if expired
    if (now > cacheEntry.expiresAt) {
      // Return null for expired entries (cleanup will handle deletion via scheduled function)
      return null;
    }
    
    return cacheEntry.value;
  },
});

/**
 * Set cached value
 */
export const setCacheValue = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { key, value, expiresAt }) => {
    const now = Date.now();
    
    // Check if entry exists
    const existing = await ctx.db
      .query("cache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        value: value as any,
        expiresAt,
        updatedAt: now,
      });
    } else {
      // Create new entry
      await ctx.db.insert("cache", {
        key,
        value: value as any,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Invalidate cache entry
 */
export const invalidateCache = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const entry = await ctx.db
      .query("cache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (entry) {
      await ctx.db.delete(entry._id);
    }
  },
});

/**
 * Cleanup expired cache entries
 */
export const cleanupExpiredCache = mutation({
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

