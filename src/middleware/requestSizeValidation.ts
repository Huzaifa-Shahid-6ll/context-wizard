/**
 * Request Size Validation Middleware
 * 
 * Validates request body sizes to prevent memory exhaustion and DoS attacks.
 * Different endpoints have different size limits based on their expected payload.
 */

import { NextRequest, NextResponse } from 'next/server';

// Request size limits in bytes
const REQUEST_SIZE_LIMITS = {
  // API endpoints
  '/api/stripe/checkout': 10 * 1024, // 10KB - Stripe checkout
  '/api/log-affiliate-click': 5 * 1024, // 5KB - Affiliate tracking
  '/api/webhooks/stripe': 100 * 1024, // 100KB - Stripe webhooks (can be large)
  '/api/feedback': 50 * 1024, // 50KB - Feedback forms
  
  // Default limits
  default: 100 * 1024, // 100KB default
  strict: 10 * 1024, // 10KB for strict endpoints
} as const;

/**
 * Get the size limit for a given path
 */
function getSizeLimit(pathname: string): number {
  // Check for specific endpoint matches
  for (const [endpoint, limit] of Object.entries(REQUEST_SIZE_LIMITS)) {
    if (endpoint !== 'default' && endpoint !== 'strict' && pathname.startsWith(endpoint)) {
      return limit;
    }
  }
  
  // Use default limit
  return REQUEST_SIZE_LIMITS.default;
}

/**
 * Validate request size
 * Returns null if valid, or NextResponse with 413 if too large
 */
export function validateRequestSize(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const contentLength = request.headers.get('content-length');
  
  // Skip validation for GET/HEAD/OPTIONS requests (no body)
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }
  
  // If content-length header is present, validate it
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const limit = getSizeLimit(pathname);
    
    if (isNaN(size) || size > limit) {
      return NextResponse.json(
        {
          error: 'Request entity too large',
          message: `Request body exceeds maximum size of ${limit / 1024}KB`,
          maxSize: limit,
          receivedSize: size,
        },
        {
          status: 413,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  // If content-length is not present, we'll need to check during body parsing
  // This is handled by Next.js body size limits, but we add this as a safety check
  return null;
}

/**
 * Get request size limit for a path (for informational purposes)
 */
export function getRequestSizeLimit(pathname: string): number {
  return getSizeLimit(pathname);
}

