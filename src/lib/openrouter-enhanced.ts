import { createHash } from "crypto";
import { getFeatureFlags } from "@/config/features";
import * as base from "@/lib/openrouter";
import { LruTtlCache } from "@/lib/cache";
import { getFallbackChain, tryModelsInSequence, UserTier } from "@/lib/modelFallback";

export interface EnhancedOptions {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
  ttlMs?: number;
}

const DEFAULTS = {
  timeoutMs: 30_000,
  retries: 3,
  baseDelayMs: 500,
  ttlMs: 60 * 60 * 1000,
} as const;

export const openRouterMetrics = {
  calls: 0,
  failures: 0,
  cacheHits: 0,
  totalLatencyMs: 0,
  record(durationMs: number, fromCache: boolean) {
    this.calls++;
    this.totalLatencyMs += durationMs;
    if (fromCache) this.cacheHits++;
  },
  recordFailure() {
    this.failures++;
  },
  summary() {
    return {
      calls: this.calls,
      failures: this.failures,
      cacheHits: this.cacheHits,
      avgLatencyMs: this.calls ? Math.round(this.totalLatencyMs / this.calls) : 0,
    };
  },
};

const cache = new LruTtlCache<string>();

function hashKey(prompt: string, model?: string, tier?: UserTier) {
  return createHash("sha256").update(JSON.stringify({ prompt, model, tier })).digest("hex");
}

async function withRetry<T>(fn: () => Promise<T>, retries: number, baseDelayMs: number): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      attempt++;
      if (attempt > retries) break;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Operation failed");
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, rej) => {
    timeoutId = setTimeout(() => rej(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return (await Promise.race([promise, timeoutPromise])) as T;
  } finally {
    clearTimeout(timeoutId!);
  }
}

export async function generateWithOpenRouterEnhanced(
  prompt: string,
  userTier: UserTier,
  model?: string,
  options: EnhancedOptions = {}
): Promise<string> {
  const { ENABLE_OPENROUTER_CACHE, ENABLE_REQUEST_TIMEOUTS, ENABLE_FALLBACK_MODELS } = getFeatureFlags();
  const { timeoutMs, retries, baseDelayMs, ttlMs } = { ...DEFAULTS, ...options };
  const key = hashKey(prompt, model, userTier);

  if (ENABLE_OPENROUTER_CACHE) {
    const cached = cache.get(key);
    if (cached) {
      openRouterMetrics.record(0, true);
      return cached;
    }
  }

  const start = Date.now();
  const chain = ENABLE_FALLBACK_MODELS ? getFallbackChain(userTier, model) : [model || ""];

  const runOnce = async (m: string) => {
    const exec = () => base.generateWithOpenRouter(prompt, userTier, m);
    const maybeTimed = ENABLE_REQUEST_TIMEOUTS ? withTimeout(exec(), timeoutMs) : exec();
    return withRetry(() => maybeTimed, retries, baseDelayMs);
  };

  try {
    const result = await (ENABLE_FALLBACK_MODELS ? tryModelsInSequence(prompt, chain, runOnce) : runOnce(chain[0]));
    if (ENABLE_OPENROUTER_CACHE) cache.set(key, result, ttlMs);
    openRouterMetrics.record(Date.now() - start, false);
    return result;
  } catch (err) {
    openRouterMetrics.recordFailure();
    throw err;
  }
}

export async function analyzePromptEnhanced(prompt: string): Promise<base.PromptAnalysis> {
  const start = Date.now();
  try {
    const res = await withTimeout(base.analyzePrompt(prompt), DEFAULTS.timeoutMs);
    openRouterMetrics.record(Date.now() - start, false);
    return res;
  } catch (err) {
    openRouterMetrics.recordFailure();
    throw err;
  }
}

export async function predictOutputEnhanced(prompt: string): Promise<base.OutputPrediction> {
  const start = Date.now();
  try {
    const res = await withTimeout(base.predictOutput(prompt), DEFAULTS.timeoutMs);
    openRouterMetrics.record(Date.now() - start, false);
    return res;
  } catch (err) {
    openRouterMetrics.recordFailure();
    throw err;
  }
}


