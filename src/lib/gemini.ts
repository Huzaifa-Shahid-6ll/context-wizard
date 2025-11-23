/**
 * Gemini API utility
 * 
 * Provides: generateWithGemini - fallback API when OpenRouter fails
 * 
 * This module implements Google's Gemini API as a fallback when OpenRouter
 * encounters rate limits, credit exhaustion, or service unavailability.
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY_FREE: API key for free tier users
 * - GEMINI_API_KEY_PRO: API key for pro tier users
 * 
 * Model Selection:
 * - Free tier: gemini-2.0-flash-exp (fast, cost-effective)
 * - Pro tier: gemini-1.5-pro (higher quality)
 */

import { GoogleGenAI } from '@google/genai';

export type GenerationResult = {
  text: string;
  provider: 'openrouter' | 'gemini';
  wasFallback: boolean;
  statusCode?: number;
  rawResponse?: any;
};

class GeminiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

export function getGeminiApiKey(userTier: 'free' | 'pro'): string {
  const key = userTier === 'pro'
    ? (process.env.GEMINI_API_KEY_PRO || '')
    : (process.env.GEMINI_API_KEY_FREE || '');
  return key;
}

function getGeminiModel(userTier: 'free' | 'pro'): string {
  // Free tier: fast, cost-effective model
  // Pro tier: higher quality model
  return userTier === 'pro'
    ? 'gemini-2.5-pro'
    : 'gemini-2.5-flash';
}

/**
 * Normalize model name - remove OpenRouter-style prefixes if present
 * e.g., "google/gemini-2.0-flash-exp:free" -> "gemini-2.0-flash-exp"
 */
function normalizeGeminiModelName(model: string): string {
  // Remove "google/" prefix if present
  if (model.startsWith('google/')) {
    model = model.substring(7);
  }
  // Remove ":free" or ":pro" suffix if present
  if (model.includes(':')) {
    model = model.split(':')[0];
  }
  return model;
}

/**
 * Generate text using Google Gemini API
 * This function matches the signature of generateWithOpenRouter for seamless fallback
 * 
 * @param prompt - The prompt string (may contain system/user messages)
 * @param userTier - 'free' or 'pro' to select appropriate API key and model
 * @param model - Optional model override (if not provided, uses tier-based default)
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @returns Generated text response
 */
export async function generateWithGemini(
  prompt: string,
  userTier: 'free' | 'pro',
  model?: string,
  timeoutMs: number = 60000,
  returnMeta?: boolean
): Promise<string | GenerationResult> {
  const apiKey = getGeminiApiKey(userTier);
  if (!apiKey) {
    throw new GeminiError('Gemini API key is missing', 401);
  }

  // Normalize model name (remove OpenRouter-style prefixes)
  const baseModel = model ? normalizeGeminiModelName(model) : getGeminiModel(userTier);

  // Initialize Gemini client with the new SDK
  const ai = new GoogleGenAI({ apiKey });

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout: Generation took longer than ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  const requestStart = Date.now();
  try {
    // Retry logic with exponential backoff
    let lastError: any;
    const maxRetries = 3;
    let retryDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Cap at 30 seconds

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Generate content with timeout handling
        // New SDK usage: ai.models.generateContent({ model: ..., contents: ... })
        const result = await Promise.race([
          ai.models.generateContent({
            model: baseModel,
            contents: prompt,
          }),
          timeoutPromise
        ]);

        // Extract response text
        // Cast to any to access properties safely if types aren't fully inferred
        const response = result as any;
        const text = response.text;

        // Standardized empty response check
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          throw new GeminiError('Empty response from Gemini API', 500);
        }

        const latencyMs = Date.now() - requestStart;
        console.log(JSON.stringify({
          ts: new Date().toISOString(),
          provider_attempt: 'gemini',
          tier: userTier,
          attempt: attempt + 1,
          status: 200,
          wasFallback: false,
          finalProvider: 'gemini',
          latencyMs,
        }));

        if (returnMeta) {
          return { text, provider: 'gemini', wasFallback: false, statusCode: 200, rawResponse: response };
        }
        return text;
      } catch (error: any) {
        lastError = error;

        // Prefer HTTP status codes when available
        const status = error.statusCode || error.status;
        const isRateLimit = status === 429 || 
          error.message?.includes('429') ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('quota');
        const isServerOverload = status === 503 ||
          error.message?.includes('503') ||
          error.message?.toLowerCase().includes('overloaded');

        if ((isRateLimit || isServerOverload) && attempt < maxRetries) {
          // Check for retry-after header if available
          const retryAfter = error.headers?.get?.('retry-after') || error.retryAfter;
          if (retryAfter) {
            retryDelay = Math.min(Number(retryAfter) * 1000, maxDelay);
          } else {
            retryDelay = Math.min(retryDelay * 2, maxDelay); // Exponential backoff with cap
          }
          
          const latencyMs = Date.now() - requestStart;
          console.log(JSON.stringify({
            ts: new Date().toISOString(),
            provider_attempt: 'gemini',
            tier: userTier,
            attempt: attempt + 1,
            status: status || 429,
            wasFallback: false,
            finalProvider: null,
            latencyMs,
            error: error.message || 'Rate limit/overload',
          }));

          console.warn(`Gemini API rate limit/overload (attempt ${attempt + 1}/${maxRetries}). Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // If not retryable or out of retries, throw
        throw error;
      }
    }

    throw lastError;
  } catch (error: any) {
    const latencyMs = Date.now() - requestStart;
    
    // Handle timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('took longer than')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 408,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: `Request timeout: Generation took longer than ${timeoutMs / 1000} seconds`,
      }));
      throw new Error(`Request timeout: Generation took longer than ${timeoutMs / 1000} seconds`);
    }

    // Prefer HTTP status codes when available
    const status = error.statusCode || error.status;
    
    // Handle Gemini-specific errors using status codes first
    if (status === 401) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 401,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Invalid Gemini API key',
      }));
      throw new GeminiError('Invalid Gemini API key', 401);
    }
    if (status === 429) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 429,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini API rate limit exceeded',
      }));
      throw new GeminiError('Gemini API rate limit exceeded', 429);
    }
    if (status === 403) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 403,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini API permission denied',
      }));
      throw new GeminiError('Gemini API permission denied', 403);
    }
    if (status === 404) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 404,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini model not found',
      }));
      throw new GeminiError('Gemini model not found', 404);
    }

    // Fallback to message parsing if no status code
    const errorMessage = error.message || String(error);
    const lowerErrorMsg = errorMessage.toLowerCase();

    if (lowerErrorMsg.includes('api key') || lowerErrorMsg.includes('invalid api key')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 401,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Invalid Gemini API key',
      }));
      throw new GeminiError('Invalid Gemini API key', 401);
    }
    if (lowerErrorMsg.includes('quota') || lowerErrorMsg.includes('rate limit') || lowerErrorMsg.includes('429')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 429,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini API rate limit exceeded',
      }));
      throw new GeminiError('Gemini API rate limit exceeded', 429);
    }
    if (lowerErrorMsg.includes('permission') || lowerErrorMsg.includes('forbidden')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 403,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini API permission denied',
      }));
      throw new GeminiError('Gemini API permission denied', 403);
    }
    if (lowerErrorMsg.includes('not found') || lowerErrorMsg.includes('404')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        provider_attempt: 'gemini',
        tier: userTier,
        attempt: 1,
        status: 404,
        wasFallback: false,
        finalProvider: null,
        latencyMs,
        error: 'Gemini model not found',
      }));
      throw new GeminiError('Gemini model not found', 404);
    }

    // Re-throw with Gemini error wrapper
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      provider_attempt: 'gemini',
      tier: userTier,
      attempt: 1,
      status: status || 500,
      wasFallback: false,
      finalProvider: null,
      latencyMs,
      error: errorMessage || 'Gemini API error',
    }));
    throw new GeminiError(
      errorMessage || 'Gemini API error',
      status || 500
    );
  }
}
