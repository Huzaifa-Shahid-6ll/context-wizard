import { getFeatureFlags } from "@/config/features";
import { generateWithOpenRouter as baseGenerate } from "@/lib/openrouter";
import { generateWithOpenRouterEnhanced } from "@/lib/openrouter-enhanced";
import type { UserTier } from "@/lib/modelFallback";

export async function wrapperGenerateWithOpenRouter(
  prompt: string,
  tier: UserTier,
  model?: string
) {
  const { ENABLE_OPENROUTER_CACHE, ENABLE_REQUEST_TIMEOUTS, ENABLE_FALLBACK_MODELS } = getFeatureFlags();
  const useEnhanced = ENABLE_OPENROUTER_CACHE || ENABLE_REQUEST_TIMEOUTS || ENABLE_FALLBACK_MODELS;
  if (!useEnhanced) return baseGenerate(prompt, tier, model);
  return generateWithOpenRouterEnhanced(prompt, tier, model);
}


