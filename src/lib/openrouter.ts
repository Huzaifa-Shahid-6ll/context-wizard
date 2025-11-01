// OpenRouter API utility
// Provides: generateWithOpenRouter, analyzePrompt, predictOutput

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
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
  }
}

const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://localhost';
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'context-wizard';

function getApiKey(userTier: 'free' | 'pro'): string {
  const key = userTier === 'pro'
    ? (process.env.OPENROUTER_API_KEY_PRO || '')
    : (process.env.OPENROUTER_API_KEY_FREE || '');
  return key;
}

function getDefaultModel(userTier: 'free' | 'pro'): string {
  return userTier === 'pro'
    ? 'anthropic/claude-3.5-sonnet'
    : 'google/gemini-2.0-flash-exp:free';
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
  try {
    const body = await res.json();
    if (body && typeof body.error === 'object' && body.error && 'message' in body.error) {
      message = String(body.error.message || message);
    }
  } catch {
    // ignore JSON parse error
  }

  if (res.status === 401) throw new OpenRouterError('Invalid API key', 401);
  if (res.status === 429) throw new OpenRouterError('Rate limit exceeded', 429);
  if (res.status === 503) throw new OpenRouterError('Model unavailable', 503);
  if (res.status >= 500) throw new OpenRouterError(message, res.status);
  throw new OpenRouterError(message, res.status);
}

export async function generateWithOpenRouter(
  prompt: string,
  userTier: 'free' | 'pro',
  model?: string
): Promise<string> {
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

  const res = await requestWithRetry(
    `${BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    },
    { maxRetries: 3, baseDelayMs: 800 }
  );

  const json = await handleOpenRouterResponse(res);
  const text = json.choices?.[0]?.message?.content ?? '';
  return text;
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
  } catch {
    return { predictedResponse: '' };
  }
}

export type { ChatMessage };


