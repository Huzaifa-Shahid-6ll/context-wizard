"use node";

import { action, query } from "./_generated/server";

export const debugEnvironment = action({
	args: {},
	handler: async () => {
		const envKeys = [
			"OPENROUTER_API_KEY_FREE",
			"OPENROUTER_API_KEY_PRO",
			"ANTHROPIC_API_KEY",
			"GITHUB_TOKEN",
			"NEXT_PUBLIC_CONVEX_URL",
		];
		const env = envKeys.map((key) => ({ key, isSet: !!process.env[key as keyof NodeJS.ProcessEnv], preview: process.env[key as keyof NodeJS.ProcessEnv]?.substring(0, 6) }));
		return { env };
	},
});

export const debugDatabase = query({
	args: {},
	handler: async (ctx) => {
		try {
			// Attempt a simple round-trip on a known table if available
			// We'll check for a 'users' count as a sanity check if the table exists
			let ok = true;
			let error: string | undefined;
			try {
				// This assumes a 'users' table exists per schema; adjust as needed
				await ctx.db.query("users").first();
			} catch (e) {
				ok = false;
				error = (e as Error).message;
			}
			return { ok, error };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	},
});

export const debugExternalApis = action({
	args: {},
	handler: async () => {
		async function ping(url: string) {
			const started = Date.now();
			try {
				const res = await fetch(url, { cache: 'no-store' });
				return { url, ok: res.ok, status: res.status, ms: Date.now() - started };
			} catch (e) {
				return { url, ok: false, error: (e as Error).message, ms: Date.now() - started };
			}
		}
		const results = await Promise.all([
			ping('https://api.github.com'),
			ping(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'),
		]);
		return { results };
	},
});


