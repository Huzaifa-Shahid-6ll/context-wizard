import { action } from "./_generated/server";

export const testEnvironment = action({
  args: {},
	handler: async () => {
    const openrouterFree = process.env.OPENROUTER_API_KEY_FREE;
    const openrouterPro = process.env.OPENROUTER_API_KEY_PRO;
    const anthropic = process.env.ANTHROPIC_API_KEY;

    return {
      hasOpenRouterFree: !!openrouterFree,
      hasOpenRouterPro: !!openrouterPro,
      hasAnthropic: !!anthropic,
      openrouterFreePrefix: openrouterFree?.substring(0, 10),
      openrouterProPrefix: openrouterPro?.substring(0, 10),
    };
  },
});