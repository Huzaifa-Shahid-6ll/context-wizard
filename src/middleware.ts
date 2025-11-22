import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkIPRateLimit, addRateLimitHeaders } from './middleware/ipRateLimit';
import { isSuspiciousBot } from './middleware/botDetection';
import { checkCSRFProtection, addCSRFTokenToResponse } from './middleware/csrf';
import { validateRequestSize } from './middleware/requestSizeValidation';
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

  // 1. Check request size FIRST (before processing, but skip webhooks)
  if (!isWebhookRoute) {
    const sizeValidationResponse = validateRequestSize(req);
    if (sizeValidationResponse) {
      // Log oversized request attempt
      logSecurityEvent('request_size_exceeded', {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        path: req.nextUrl.pathname,
        contentLength: req.headers.get('content-length'),
        userAgent: req.headers.get('user-agent'),
      });
      return sizeValidationResponse;
    }
  }

  // 2. Check IP rate limit (before auth, but skip webhooks)
  if (!isWebhookRoute) {
    const rateLimitResponse = await checkIPRateLimit(req);
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

  // 4. Bot detection for non-public routes (skip webhooks)
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

  // 5. CSRF protection for state-changing requests (skip webhooks)
  if (!isWebhookRoute) {
    const csrfResponse = checkCSRFProtection(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }

  // 6. Protect routes that require auth
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 7. Add rate limit headers and CSRF token to response (skip webhooks)
  const response = NextResponse.next();
  if (!isWebhookRoute) {
    const responseWithRateLimit = addRateLimitHeaders(response, req);
    return addCSRFTokenToResponse(responseWithRateLimit, req);
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
