// This file runs at app startup (server-side only)
// Next.js will automatically call this export function

export async function register() {
  // Import and validate environment variables
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env');
    validateEnv();
  }
}

