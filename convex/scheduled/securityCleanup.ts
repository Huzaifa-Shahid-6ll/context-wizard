import { action } from "../_generated/server";

export const runSecurityCleanup = action({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const events = await ctx.db.query("securityEvents").collect();
    for (const ev of events) {
      if (ev.timestamp < cutoff) await ctx.db.delete(ev._id);
    }
    const bans = await ctx.db.query("bannedIps").collect();
    for (const ban of bans) {
      if (ban.expiresAt && Date.now() > ban.expiresAt) await ctx.db.delete(ban._id);
    }
    return { ok: true } as const;
  },
});


