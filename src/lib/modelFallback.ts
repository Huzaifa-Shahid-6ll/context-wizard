export type UserTier = "free" | "pro";

const CHAINS: Record<UserTier, string[]> = {
  free: ["google/gemini-2.0-flash-exp:free", "openai/gpt-4o-mini"],
  pro: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "google/gemini-pro"],
};

export function getFallbackChain(tier: UserTier, primaryModel?: string): string[] {
  const base = CHAINS[tier];
  if (!primaryModel) return base;
  return [primaryModel, ...base.filter((m) => m !== primaryModel)];
}

export async function tryModelsInSequence<T>(
  prompt: string,
  chain: string[],
  runner: (model: string) => Promise<T>
): Promise<T> {
  let lastErr: unknown;
  for (const model of chain) {
    try {
      return await runner(model);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All fallback models failed");
}


