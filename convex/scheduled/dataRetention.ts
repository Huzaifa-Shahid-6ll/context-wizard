/**
 * Scheduled function for data retention policies
 * 
 * Automatically removes old records based on retention policies
 */

import { internalMutation } from "../_generated/server";

// Retention periods in milliseconds
const RETENTION_PERIODS = {
  securityEvents: 90 * 24 * 60 * 60 * 1000, // 90 days
  webhookLogs: 30 * 24 * 60 * 60 * 1000, // 30 days
  feedback: 365 * 24 * 60 * 60 * 1000, // 1 year (keep for analysis)
  affiliateClicks: 180 * 24 * 60 * 60 * 1000, // 180 days
} as const;

export const cleanupOldRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results: Record<string, { deleted: number }> = {};

    // Cleanup security events older than retention period
    const securityEventsCutoff = now - RETENTION_PERIODS.securityEvents;
    const oldSecurityEvents = await ctx.db
      .query("securityEvents")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", securityEventsCutoff))
      .collect();
    for (const event of oldSecurityEvents) {
      await ctx.db.delete(event._id);
    }
    results.securityEvents = { deleted: oldSecurityEvents.length };

    // Cleanup webhook logs older than retention period
    const webhookLogsCutoff = now - RETENTION_PERIODS.webhookLogs;
    const oldWebhookLogs = await ctx.db
      .query("webhookLogs")
      .withIndex("by_processedAt", (q) => q.lt("processedAt", webhookLogsCutoff))
      .collect();
    for (const log of oldWebhookLogs) {
      await ctx.db.delete(log._id);
    }
    results.webhookLogs = { deleted: oldWebhookLogs.length };

    // Cleanup affiliate clicks older than retention period
    const affiliateClicksCutoff = now - RETENTION_PERIODS.affiliateClicks;
    const oldAffiliateClicks = await ctx.db
      .query("affiliateClicks")
      .withIndex("by_clickedAt", (q) => q.lt("clickedAt", affiliateClicksCutoff))
      .collect();
    for (const click of oldAffiliateClicks) {
      await ctx.db.delete(click._id);
    }
    results.affiliateClicks = { deleted: oldAffiliateClicks.length };

    return results;
  },
});

