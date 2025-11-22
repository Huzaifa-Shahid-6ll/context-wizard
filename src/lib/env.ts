// Validate env vars at startup

const requiredEnvVars = [
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENROUTER_API_KEY_FREE',
] as const;

// Optional env vars (for fallback functionality)
const optionalEnvVars = [
  'GEMINI_API_KEY_FREE',
  'GEMINI_API_KEY_PRO',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}`
    );
  }

  // Warn if optional Gemini keys are missing (fallback won't work but app still functions)
  const missingGeminiKeys: string[] = [];
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      missingGeminiKeys.push(varName);
    }
  }

  if (missingGeminiKeys.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `Optional environment variables missing (Gemini fallback will not work):\n${missingGeminiKeys.join('\n')}`
    );
  }
}

// Call at app startup
if (typeof window === 'undefined') {
  validateEnv();
}

