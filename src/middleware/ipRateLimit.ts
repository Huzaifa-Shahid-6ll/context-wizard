import { NextRequest, NextResponse } from 'next/server';

// In-memory store (resets on deployment, but sufficient for basic protection)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

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

function getRateLimitKey(ip: string, path: string): string {
  // Different limits for different endpoints
  if (path.startsWith('/api/auth')) return `auth:${ip}`;
  if (path.includes('/generate')) return `generation:${ip}`;
  if (path.startsWith('/api/')) return `api:${ip}`;
  return `default:${ip}`;
}

function getRateLimitConfig(key: string) {
  if (key.startsWith('auth:')) return RATE_LIMITS.auth;
  if (key.startsWith('generation:')) return RATE_LIMITS.generation;
  if (key.startsWith('api:')) return RATE_LIMITS.api;
  return RATE_LIMITS.default;
}

export function checkIPRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const key = getRateLimitKey(ip, path);
  const config = getRateLimitConfig(key);

  const now = Date.now();
  const record = requestCounts.get(key);

  // Clean up expired entries (simple garbage collection)
  if (requestCounts.size > 10000) {
    for (const [k, v] of requestCounts.entries()) {
      if (v.resetAt < now) requestCounts.delete(k);
    }
  }

  if (!record || record.resetAt < now) {
    // Create new window
    requestCounts.set(key, {
      count: 1,
      resetAt: now + config.window,
    });
    return null; // Allow request
  }

  if (record.count >= config.limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);

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
          'X-RateLimit-Reset': Math.ceil(record.resetAt / 1000).toString(),
        },
      }
    );
  }

  // Increment counter
  record.count++;
  return null; // Allow request
}

export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const key = getRateLimitKey(ip, path);
  const config = getRateLimitConfig(key);
  const record = requestCounts.get(key);

  if (record && record.resetAt > Date.now()) {
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, config.limit - record.count).toString()
    );
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(record.resetAt / 1000).toString()
    );
  }

  return response;
}

