import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkIPRateLimit, addRateLimitHeaders } from './middleware/ipRateLimit';
import { isSuspiciousBot } from './middleware/botDetection';
import { logSecurityEvent } from './lib/securityLogger';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/tools',
  '/terms',
  '/privacy',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Exclude webhook routes from rate limiting
  const isWebhookRoute = req.nextUrl.pathname.startsWith('/api/webhooks/');

  // 1. Check IP rate limit FIRST (before auth, but skip webhooks)
  if (!isWebhookRoute) {
    const rateLimitResponse = checkIPRateLimit(req);
    if (rateLimitResponse) {
      // Track rate limit hit in analytics
      logSecurityEvent('rate_limit', {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        path: req.nextUrl.pathname,
        userAgent: req.headers.get('user-agent'),
      });
      return rateLimitResponse;
    }
  }

  // 2. Bot detection for non-public routes (skip webhooks)
  if (!isPublicRoute(req) && !isWebhookRoute) {
    if (isSuspiciousBot(req)) {
      logSecurityEvent('bot_detected', {
        userAgent: req.headers.get('user-agent'),
        path: req.nextUrl.pathname,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  // 3. Protect routes that require auth
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 4. Add rate limit headers to response (skip webhooks)
  const response = NextResponse.next();
  if (!isWebhookRoute) {
    return addRateLimitHeaders(response, req);
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
