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
  timeoutMs: number = 60000
): Promise<string> {
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

  try {
    // Retry logic with exponential backoff
    let lastError: any;
    const maxRetries = 3;
    let retryDelay = 2000; // Start with 2 seconds

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

        if (!text) {
          throw new GeminiError('Empty response from Gemini API', 500);
        }

        return text;
      } catch (error: any) {
        lastError = error;

        // Check if we should retry (only on 429 or 503)
        const isRateLimit = error.message?.includes('429') ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('quota');
        const isServerOverload = error.message?.includes('503') ||
          error.message?.toLowerCase().includes('overloaded');

        if ((isRateLimit || isServerOverload) && attempt < maxRetries) {
          console.warn(`Gemini API rate limit/overload (attempt ${attempt + 1}/${maxRetries}). Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
          continue;
        }

        // If not retryable or out of retries, throw
        throw error;
      }
    }

    throw lastError;
  } catch (error: any) {
    // Handle timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('took longer than')) {
      throw new Error(`Request timeout: Generation took longer than ${timeoutMs / 1000} seconds`);
    }

    // Handle Gemini-specific errors
    const errorMessage = error.message || String(error);
    const lowerErrorMsg = errorMessage.toLowerCase();

    if (lowerErrorMsg.includes('api key') || lowerErrorMsg.includes('invalid api key')) {
      throw new GeminiError('Invalid Gemini API key', 401);
    }
    if (lowerErrorMsg.includes('quota') || lowerErrorMsg.includes('rate limit') || lowerErrorMsg.includes('429')) {
      throw new GeminiError('Gemini API rate limit exceeded', 429);
    }
    if (lowerErrorMsg.includes('permission') || lowerErrorMsg.includes('forbidden')) {
      throw new GeminiError('Gemini API permission denied', 403);
    }
    if (lowerErrorMsg.includes('not found') || lowerErrorMsg.includes('404')) {
      throw new GeminiError('Gemini model not found', 404);
    }

    // Re-throw with Gemini error wrapper
    throw new GeminiError(
      errorMessage || 'Gemini API error',
      error.statusCode || error.status || 500
    );
  }
}
