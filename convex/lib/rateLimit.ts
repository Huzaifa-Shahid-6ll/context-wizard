/**
 * Rate limiting utilities for Convex
 * Provides persistent rate limiting using Convex database
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Rate limit configuration
export const RATE_LIMITS = {
  // Prompt generation limits
  PROMPT_GENERATION_FREE: { count: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 per day
  PROMPT_GENERATION_PRO: { count: Number.MAX_SAFE_INTEGER, windowMs: 24 * 60 * 60 * 1000 },
  
  // Chat limits
  CHAT_CREATION_FREE: { count: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
  CHAT_MESSAGES_FREE: { count: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per chat
  
  // API rate limits
  API_REQUESTS: { count: 100, windowMs: 60 * 1000 }, // 100 per minute
  WEBHOOK_REQUESTS: { count: 100, windowMs: 60 * 1000 }, // 100 per minute per IP
} as const;

/**
 * Get rate limit key for a user/IP and action
 */
function getRateLimitKey(
  identifier: string, // userId or IP address
  action: string,
  windowStart: number
): string {
  // For daily limits, use date string
  if (action.includes("_per_day") || action.includes("generation") || action.includes("chat")) {
    const dateKey = new Date(windowStart).toISOString().split('T')[0];
    return `${action}:${identifier}:${dateKey}`;
  }
  // For time-based windows, use window start timestamp
  return `${action}:${identifier}:${windowStart}`;
}

/**
 * Check if user/IP can perform action (query)
 */
export const checkRateLimit = query({
  args: {
    identifier: v.string(), // userId or IP address
    action: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, { identifier, action, limit, windowMs }) => {
    const now = Date.now();
    const windowStart = now - (now % windowMs);
    const key = getRateLimitKey(identifier, action, windowStart);
    
    // Query existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    // If no record exists, allow the request
    if (!existing) {
      return {
        allowed: true,
        remaining: limit,
        resetAt: windowStart + windowMs,
        count: 0,
      };
    }
    
    // Check if the rate limit window has expired
    if (now > existing.resetAt) {
      // Window expired, allow the request
      return {
        allowed: true,
        remaining: limit,
        resetAt: windowStart + windowMs,
        count: 0,
      };
    }
    
    // Check if limit is exceeded
    const remaining = Math.max(0, limit - existing.count);
    const allowed = existing.count < limit;
    
    return {
      allowed,
      remaining,
      resetAt: existing.resetAt,
      count: existing.count,
    };
  },
});

/**
 * Increment rate limit counter and check if limit is exceeded (mutation)
 */
export const incrementRateLimit = mutation({
  args: {
    identifier: v.string(), // userId or IP address
    action: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, { identifier, action, limit, windowMs }) => {
    const now = Date.now();
    const windowStart = now - (now % windowMs);
    const key = getRateLimitKey(identifier, action, windowStart);
    const resetAt = windowStart + windowMs;
    
    // Query existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    let count: number;
    let shouldUpdate = false;
    
    if (!existing) {
      // Create new record
      count = 1;
      await ctx.db.insert("rateLimits", {
        key,
        count: 1,
        resetAt,
        createdAt: now,
        updatedAt: now,
      });
    } else if (now > existing.resetAt) {
      // Window expired, reset count
      count = 1;
      shouldUpdate = true;
    } else {
      // Increment existing count
      count = existing.count + 1;
      shouldUpdate = true;
    }
    
    // Update existing record if needed
    if (shouldUpdate && existing) {
      await ctx.db.patch(existing._id, {
        count,
        resetAt,
        updatedAt: now,
      });
    }
    
    // Check if limit is exceeded
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    
    return {
      allowed,
      count,
      remaining,
      resetAt,
    };
  },
});

/**
 * Cleanup expired rate limit records (mutation)
 * Should be called periodically (e.g., via cron or scheduled function)
 */
export const cleanupExpiredRateLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all expired rate limit records
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_resetAt", (q) => q.lt("resetAt", now))
      .collect();
    
    // Delete expired records
    let deleted = 0;
    for (const record of expired) {
      await ctx.db.delete(record._id);
      deleted++;
    }
    
    return { deleted, total: expired.length };
  },
});

/**
 * Get rate limit status for an identifier (query)
 */
export const getRateLimitStatus = query({
  args: {
    identifier: v.string(),
    action: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, { identifier, action, limit, windowMs }) => {
    const now = Date.now();
    const windowStart = now - (now % windowMs);
    const key = getRateLimitKey(identifier, action, windowStart);
    
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (!existing || now > existing.resetAt) {
      return {
        count: 0,
        limit,
        remaining: limit,
        resetAt: windowStart + windowMs,
        isExpired: true,
      };
    }
    
    return {
      count: existing.count,
      limit,
      remaining: Math.max(0, limit - existing.count),
      resetAt: existing.resetAt,
      isExpired: false,
    };
  },
});
