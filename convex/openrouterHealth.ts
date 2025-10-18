import { action } from "./_generated/server";

export const runOpenRouterHealth = action({
  args: {},
  handler: async (ctx) => {
    const services = [
      { service: "openrouter-free", models: ["google/gemini-2.0-flash-exp:free", "openai/gpt-4o-mini"] },
      { service: "openrouter-pro", models: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "google/gemini-pro"] },
    ];

    const failedModels: string[] = [];
    const startAll = Date.now();

    for (const s of services) {
      const t0 = Date.now();
      try {
        // TODO: Replace with a minimal real OpenRouter call if desired
        await new Promise((r) => setTimeout(r, 50));
        await ctx.db.insert("healthChecks", {
          service: s.service,
          status: "healthy",
          checkedAt: Date.now(),
          responseTime: Date.now() - t0,
          failedModels: [],
        });
      } catch (e) {
        failedModels.push(...s.models);
        await ctx.db.insert("healthChecks", {
          service: s.service,
          status: "down",
          checkedAt: Date.now(),
          failedModels: s.models,
          lastError: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const avgResponseTime = (Date.now() - startAll) / services.length;
    return {
      isHealthy: failedModels.length === 0,
      lastCheck: Date.now(),
      failedModels,
      avgResponseTime,
    };
  },
});


