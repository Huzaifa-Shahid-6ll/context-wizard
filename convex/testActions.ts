"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const testEnvVars = action({
	args: {},
	handler: async () => {
		return {
			hasOpenRouterFree: !!process.env.OPENROUTER_API_KEY_FREE,
			hasOpenRouterPro: !!process.env.OPENROUTER_API_KEY_PRO,
			hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
			hasGithubToken: !!process.env.GITHUB_TOKEN || !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
		};
	},
});

export const testCallOpenRouter = action({
	args: { prompt: v.string(), tier: v.union(v.literal("free"), v.literal("pro")) },
	handler: async (_ctx, { tier }) => {
		const key = tier === 'pro' ? process.env.OPENROUTER_API_KEY_PRO : process.env.OPENROUTER_API_KEY_FREE;
		return {
			hasKey: !!key,
			keyPrefix: key?.substring(0, 10),
		};
	},
});

export const testCallGithub = action({
	args: { owner: v.string(), repo: v.string() },
	handler: async (_ctx, { owner, repo }) => {
		try {
			const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { cache: 'no-store' });
			return { ok: res.ok, status: res.status };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	},
});


