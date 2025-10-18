import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logSecurityEvent = mutation({
  args: {
    type: v.string(),
    userId: v.optional(v.string()),
    ip: v.string(),
    fingerprint: v.string(),
    details: v.any(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("securityEvents", { ...args, timestamp: Date.now() });
  },
});

export const checkIfBanned = query({
  args: { ip: v.string() },
  handler: async (ctx, { ip }) => {
    const ban = await ctx.db.query("bannedIps").withIndex("by_ip", (q) => q.eq("ip", ip)).unique();
    if (!ban) return { banned: false } as const;
    if (ban.expiresAt && Date.now() > ban.expiresAt) return { banned: false } as const;
    return { banned: true as const, reason: ban.reason };
  },
});

export const banIp = mutation({
  args: { ip: v.string(), reason: v.string(), durationMs: v.optional(v.number()), bannedBy: v.string() },
  handler: async (ctx, { ip, reason, durationMs, bannedBy }) => {
    const expiresAt = durationMs ? Date.now() + durationMs : undefined;
    await ctx.db.insert("bannedIps", { ip, reason, bannedAt: Date.now(), expiresAt, bannedBy });
  },
});

export const unbanIp = mutation({
  args: { ip: v.string() },
  handler: async (ctx, { ip }) => {
    const ban = await ctx.db.query("bannedIps").withIndex("by_ip", (q) => q.eq("ip", ip)).unique();
    if (ban?._id) await ctx.db.delete(ban._id);
  },
});

export const getSecurityStats = query({
  args: {},
  handler: async (ctx) => {
    const bans = await ctx.db.query("bannedIps").collect();
    return { banCount: bans.length };
  },
});


