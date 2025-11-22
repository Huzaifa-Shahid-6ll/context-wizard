/**
 * CSRF Protection Middleware
 * 
 * Validates CSRF tokens for state-changing requests to prevent cross-site request forgery.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken, requiresCSRFProtection, getOrCreateCSRFToken, createCSRFTokenResponse } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/securityLogger';

/**
 * Check CSRF protection for the request
 * Returns null if valid, or NextResponse with 403 if invalid
 */
export function checkCSRFProtection(request: NextRequest): NextResponse | null {
  // Skip if CSRF protection not required
  if (!requiresCSRFProtection(request)) {
    return null;
  }

  // Validate CSRF token
  const isValid = validateCSRFToken(request);
  
  if (!isValid) {
    // Log security event
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    logSecurityEvent('csrf_validation_failed', {
      ip,
      path: request.nextUrl.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
      { status: 403 }
    );
  }

  return null; // Valid CSRF token
}

/**
 * Add CSRF token to response headers and cookie
 * This allows the frontend to read the token and include it in subsequent requests
 */
export function addCSRFTokenToResponse(response: NextResponse, request: NextRequest): NextResponse {
  try {
    const token = getOrCreateCSRFToken(request);
    // Add token to response header so frontend can read it
    response.headers.set('X-CSRF-Token', token);
    // Set cookie if not already set
    if (!getCSRFTokenFromRequest(request)) {
      return createCSRFTokenResponse(response, token);
    }
  } catch (error) {
    // If token generation fails, log but don't block response
    console.error('Failed to add CSRF token to response:', error);
  }
  
  return response;
}

// Helper to get token from request (re-exported for convenience)
function getCSRFTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies['csrf-token'] || null;
}

