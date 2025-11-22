/**
 * OpenRouter API utility
 * 
 * Provides: generateWithOpenRouter, analyzePrompt, predictOutput
 * 
 * Features:
 * - Automatic fallback to Gemini API when OpenRouter encounters:
 *   - Rate limits (HTTP 429)
 *   - Credit exhaustion (HTTP 401 with credit/quota error)
 *   - Service unavailable (HTTP 503)
 *   - Server errors (HTTP 5xx)
 * 
 * The fallback mechanism is transparent - no code changes needed at call sites.
 * Fallback uses the same user tier (free/pro) to select appropriate Gemini API key.
 * 
 * SECURITY: This module must only be used server-side. API keys are never exposed to the client.
 */

// Server-only guard - prevent client-side usage
if (typeof window !== 'undefined') {
  throw new Error('OpenRouter utilities can only be used server-side. API keys must never be exposed to the client.');
}

import { generateWithGemini } from './gemini';
import { getCircuitBreaker } from './circuitBreaker';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenRouterRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

export type OpenRouterResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index?: number;
    message: { role: string; content: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type PromptAnalysis = {
  score: number;
  issues: string[];
  suggestions: string[];
};

export type OutputPrediction = {
  predictedResponse: string;
};

class OpenRouterError extends Error {
  status?: number;
  shouldFallback?: boolean; // Flag to indicate if fallback should be attempted
  constructor(message: string, status?: number, shouldFallback: boolean = false) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.shouldFallback = shouldFallback;
  }
}

const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://localhost';
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'context-wizard';

export function getApiKey(userTier: 'free' | 'pro'): string {
  const key = userTier === 'pro'
    ? (process.env.OPENROUTER_API_KEY_PRO || '')
    : (process.env.OPENROUTER_API_KEY_FREE || '');
  return key;
}

function getDefaultModel(userTier: 'free' | 'pro'): string {
  return userTier === 'pro'
    ? 'anthropic/claude-3.5-sonnet'
    : 'mistralai/mistral-7b-instruct:free';
}

function buildHeaders(apiKey: string): HeadersInit {
  const headers: HeadersInit = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': SITE_URL,
    'X-Title': APP_NAME,
  };
  return headers;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  opts: { maxRetries: number; baseDelayMs: number }
): Promise<Response> {
  let attempt = 0;
  let delay = opts.baseDelayMs;

  while (true) {
    try {
      const res = await fetch(input, init);
      if (res.status === 429 || res.status === 503) {
        if (attempt >= opts.maxRetries) return res;
        const retryAfter = res.headers.get('retry-after');
        const retryMs = retryAfter ? Number(retryAfter) * 1000 : delay;
        await sleep(retryMs);
        attempt += 1;
        delay *= 2; // exponential backoff
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= opts.maxRetries) throw err;
      await sleep(delay);
      attempt += 1;
      delay *= 2;
    }
  }
}

async function handleOpenRouterResponse(res: Response): Promise<OpenRouterResponse> {
  if (res.ok) {
    return res.json() as Promise<OpenRouterResponse>;
  }

  let message = `OpenRouter API error: ${res.status} ${res.statusText}`;
  let errorBody: any = null;

  try {
    errorBody = await res.json();
    if (errorBody && typeof errorBody.error === 'object' && errorBody.error && 'message' in errorBody.error) {
      message = String(errorBody.error.message || message);
    }
  } catch {
    // ignore JSON parse error
  }

  // Determine if fallback should be attempted based on error type
  let shouldFallback = false;

  if (res.status === 429) {
    // Rate limit exceeded - always fallback
    shouldFallback = true;
    throw new OpenRouterError('Rate limit exceeded', 429, shouldFallback);
  }

  if (res.status === 401) {
    // Check if it's credit exhaustion vs invalid key
    const errorMsg = (errorBody?.error?.message || message).toLowerCase();
    const isCreditExhausted =
      errorMsg.includes('credit') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('insufficient') ||
      errorMsg.includes('balance') ||
      errorMsg.includes('exceeded');

    if (isCreditExhausted) {
      // Credit exhausted - trigger fallback
      shouldFallback = true;
      throw new OpenRouterError('Credit exhausted', 401, shouldFallback);
    } else {
      // Invalid API key - don't fallback (configuration error)
      throw new OpenRouterError('Invalid API key', 401, false);
    }
  }

  if (res.status === 503) {
    // Service unavailable - fallback
    shouldFallback = true;
    throw new OpenRouterError('Model unavailable', 503, shouldFallback);
  }

  if (res.status >= 500) {
    // Server errors - consider fallback
    shouldFallback = true;
    throw new OpenRouterError(message, res.status, shouldFallback);
  }

  // Other errors (400, 402, etc.) - don't fallback
  throw new OpenRouterError(message, res.status, false);
}

/**
 * Helper function to determine if an error should trigger Gemini fallback
 */
function shouldFallbackToGemini(error: any): boolean {
  // Check if error is an OpenRouterError with shouldFallback flag
  if (error instanceof OpenRouterError && error.shouldFallback) {
    return true;
  }

  // Check for specific error conditions
  if (error?.status === 429 || error?.status === 503) {
    return true;
  }

  // Check for credit exhaustion in 401 errors
  if (error?.status === 401) {
    const errorMsg = (error.message || '').toLowerCase();
    return errorMsg.includes('credit') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('insufficient') ||
      errorMsg.includes('balance') ||
      errorMsg.includes('exceeded');
  }

  // Check for server errors (5xx)
  if (error?.status >= 500) {
    return true;
  }

  return false;
}

export async function generateWithOpenRouter(
  prompt: string,
  userTier: 'free' | 'pro',
  model?: string,
  timeoutMs: number = 60000 // Default 60 second timeout
): Promise<string> {
  const circuitBreaker = getCircuitBreaker('openrouter', {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringWindow: 60000, // 1 minute
  });

  return circuitBreaker.execute(async () => {
    const apiKey = getApiKey(userTier);
    if (!apiKey) throw new OpenRouterError('API key is missing', 401);

    const chosenModel = model || getDefaultModel(userTier);
    const body: OpenRouterRequest = {
      model: chosenModel,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await requestWithRetry(
        `${BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: buildHeaders(apiKey),
          body: JSON.stringify(body),
          signal: controller.signal,
        },
        { maxRetries: 3, baseDelayMs: 800 }
      );
      clearTimeout(timeoutId);
      const json = await handleOpenRouterResponse(res);
      const text = json.choices?.[0]?.message?.content ?? '';
      return text;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout errors
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        throw new Error(`Request timeout: Generation took longer than ${timeoutMs / 1000} seconds`);
      }

      // Check if we should fallback to Gemini
      if (shouldFallbackToGemini(error)) {
        console.warn('OpenRouter failed, falling back to Gemini', {
          error: error.message,
          status: error.status,
          tier: userTier,
          timestamp: new Date().toISOString()
        });

        try {
          const fallbackResult = await generateWithGemini(prompt, userTier, undefined, timeoutMs);
          console.info('Gemini fallback succeeded', {
            tier: userTier,
            timestamp: new Date().toISOString()
          });
          return fallbackResult;
        } catch (fallbackError: any) {
          console.error('Gemini fallback also failed', {
            error: fallbackError.message,
            tier: userTier,
            timestamp: new Date().toISOString()
          });
          // If Gemini also fails, throw the original OpenRouter error
          throw error;
        }
      }

      // Don't fallback for other errors
      throw error;
    }
  });
}

export async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  // Use a generally fast, inexpensive model
  const fastModel = 'google/gemini-2.0-flash-exp:free';
  const apiKey = getApiKey('free') || getApiKey('pro');
  if (!apiKey) throw new OpenRouterError('API key is missing', 401);

  const analysisInstruction = `Analyze the user's prompt for clarity, completeness, and specificity.
Return a compact JSON object with keys: score (0-100), issues (string[]), suggestions (string[]).
Only return JSON, no extra text.`;

  const body: OpenRouterRequest = {
    model: fastModel,
    messages: [
      { role: 'system', content: analysisInstruction },
      { role: 'user', content: prompt },
    ],
  };

  try {
    const res = await requestWithRetry(
      `${BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: JSON.stringify(body),
      },
      { maxRetries: 2, baseDelayMs: 600 }
    );

    const json = await handleOpenRouterResponse(res);
    const content = json.choices?.[0]?.message?.content ?? '';

    try {
      const parsed = JSON.parse(content) as Partial<PromptAnalysis>;
      return {
        score: Number(parsed.score) || 0,
        issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
      };
    } catch {
      // Fallback heuristic if the model returns non-JSON
      return { score: 0, issues: [], suggestions: [] };
    }
  } catch (error: any) {
    // Check if we should fallback to Gemini
    if (shouldFallbackToGemini(error)) {
      const userTier = apiKey === getApiKey('pro') ? 'pro' : 'free';

      console.warn('OpenRouter failed in analyzePrompt, falling back to Gemini', {
        error: error.message,
        status: error.status,
        tier: userTier,
        timestamp: new Date().toISOString()
      });

      try {
        const fullPrompt = `${analysisInstruction}\n\nUser prompt: ${prompt}`;
        const fallbackResult = await generateWithGemini(fullPrompt, userTier, 'gemini-2.0-flash-exp');

        try {
          const parsed = JSON.parse(fallbackResult) as Partial<PromptAnalysis>;
          return {
            score: Number(parsed.score) || 0,
            issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
          };
        } catch {
          // Fallback heuristic if the model returns non-JSON
          return { score: 0, issues: [], suggestions: [] };
        }
      } catch (fallbackError: any) {
        console.error('Gemini fallback also failed in analyzePrompt', {
          error: fallbackError.message,
          tier: userTier,
          timestamp: new Date().toISOString()
        });
        // If Gemini also fails, return default analysis
        return { score: 0, issues: [], suggestions: [] };
      }
    }

    // If not a fallback error, return default analysis
    return { score: 0, issues: [], suggestions: [] };
  }
}

export async function predictOutput(prompt: string): Promise<OutputPrediction> {
  // Heuristic stub. Optionally call a fast model to summarize likely output.
  const fastModel = 'google/gemini-2.0-flash-exp:free';
  const apiKey = getApiKey('free') || getApiKey('pro');
  if (!apiKey) return { predictedResponse: '' };

  const instruction = `Given the user's prompt, briefly predict the structure/content the assistant will likely return.
Return 1-2 sentences.`;

  const body: OpenRouterRequest = {
    model: fastModel,
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content: prompt },
    ],
    max_tokens: 200,
  };

  try {
    const res = await requestWithRetry(
      `${BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: JSON.stringify(body),
      },
      { maxRetries: 2, baseDelayMs: 600 }
    );
    const json = await handleOpenRouterResponse(res);
    const content = json.choices?.[0]?.message?.content ?? '';
    return { predictedResponse: content };
  } catch (error: any) {
    // Check if we should fallback to Gemini
    if (shouldFallbackToGemini(error)) {
      const userTier = apiKey === getApiKey('pro') ? 'pro' : 'free';

      console.warn('OpenRouter failed in predictOutput, falling back to Gemini', {
        error: error.message,
        status: error.status,
        tier: userTier,
        timestamp: new Date().toISOString()
      });

      try {
        const fullPrompt = `${instruction}\n\nUser prompt: ${prompt}`;
        const fallbackResult = await generateWithGemini(fullPrompt, userTier, 'gemini-2.0-flash-exp');
        return { predictedResponse: fallbackResult };
      } catch (fallbackError: any) {
        console.error('Gemini fallback also failed in predictOutput', {
          error: fallbackError.message,
          tier: userTier,
          timestamp: new Date().toISOString()
        });
        // If Gemini also fails, return empty prediction
        return { predictedResponse: '' };
      }
    }

    // If not a fallback error, return empty prediction
    return { predictedResponse: '' };
  }
}

export type { ChatMessage };
