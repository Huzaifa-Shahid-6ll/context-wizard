import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

// Convex client for rate limiting (initialized lazily)
let convexClient: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    }
    convexClient = new ConvexHttpClient(convexUrl);
  }
  return convexClient;
}

const RATE_LIMITS = {
  // Requests per window (in milliseconds)
  api: { limit: 100, window: 60000 }, // 100 requests per minute
  generation: { limit: 10, window: 300000 }, // 10 generations per 5 minutes
  auth: { limit: 5, window: 300000 }, // 5 auth attempts per 5 minutes
  default: { limit: 60, window: 60000 }, // 60 requests per minute (general)
};

function getClientIP(request: NextRequest): string {
  // Try multiple headers for real IP (Vercel-specific)
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  if (cfConnecting) return cfConnecting;

  return 'unknown';
}

function getRateLimitAction(path: string): string {
  // Different limits for different endpoints
  if (path.startsWith('/api/auth')) return 'auth';
  if (path.includes('/generate')) return 'generation';
  if (path.startsWith('/api/')) return 'api';
  return 'default';
}

function getRateLimitConfig(action: string) {
  if (action === 'auth') return RATE_LIMITS.auth;
  if (action === 'generation') return RATE_LIMITS.generation;
  if (action === 'api') return RATE_LIMITS.api;
  return RATE_LIMITS.default;
}

/**
 * Check IP rate limit using Convex persistent storage
 * Returns null if allowed, or NextResponse with 429 if rate limited
 */
export async function checkIPRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const action = getRateLimitAction(path);
  const config = getRateLimitConfig(action);

  try {
    // Get Convex client inside try-catch to handle initialization errors
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.warn('[checkIPRateLimit] NEXT_PUBLIC_CONVEX_URL not set, allowing request');
      return null;
    }

    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.mutations.incrementRateLimit, {
      identifier: ip,
      action: `middleware_${action}`,
      limit: config.limit,
      windowMs: config.window,
    });

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please slow down and try again in a few minutes.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
          },
        }
      );
    }

    // Store rate limit info in request for headers
    (request as any).__rateLimitInfo = {
      limit: config.limit,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };

    return null; // Allow request
  } catch (error) {
    // If Convex call fails, log but allow request (fail open for availability)
    // This prevents app crashes when Convex is unreachable
    console.error('[checkIPRateLimit] Failed, allowing request:', error instanceof Error ? error.message : error);
    return null; // Allow request on error
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const rateLimitInfo = (request as any).__rateLimitInfo;

  if (rateLimitInfo) {
    response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, rateLimitInfo.remaining).toString()
    );
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(rateLimitInfo.resetAt / 1000).toString()
    );
  }

  return response;
}

