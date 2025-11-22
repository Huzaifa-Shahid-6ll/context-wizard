/**
 * CSRF Protection Utilities
 * 
 * Implements CSRF token generation and validation to prevent cross-site request forgery attacks.
 * Uses double-submit cookie pattern for stateless CSRF protection.
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token using Web Crypto API (Edge Runtime compatible)
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API instead of Node crypto for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get CSRF token from request cookie
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[CSRF_TOKEN_COOKIE_NAME] || null;
}

/**
 * Create a response with CSRF token cookie set
 */
export function createCSRFTokenResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript for double-submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Edge Runtime compatible implementation
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate CSRF token from request
 * Uses double-submit cookie pattern: token must match between header and cookie
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);
  if (!headerToken) {
    return false;
  }

  // Get token from cookie
  const cookieToken = getCSRFTokenFromRequest(request);
  if (!cookieToken) {
    return false;
  }

  // Tokens must match (double-submit pattern)
  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Check if request needs CSRF protection
 * State-changing methods (POST, PUT, DELETE, PATCH) need protection
 */
export function requiresCSRFProtection(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  const pathname = request.nextUrl.pathname;

  // Skip CSRF for webhooks (they use signature verification instead)
  if (pathname.startsWith('/api/webhooks/')) {
    return false;
  }

  // Skip CSRF for the home page (it's a static landing page)
  if (pathname === '/') {
    return false;
  }

  // Skip CSRF for Clerk authentication routes
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return false;
  }

  // Skip CSRF for dashboard (uses Clerk for auth)
  if (pathname.startsWith('/dashboard')) {
    return false;
  }

  // Skip CSRF for public GET/HEAD/OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return false;
  }

  // Protect all state-changing methods on API routes
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  return false;
}

/**
 * Get or create CSRF token for the current request
 * If token doesn't exist in request, generates a new one
 */
export function getOrCreateCSRFToken(request: NextRequest): string {
  let token = getCSRFTokenFromRequest(request);

  if (!token) {
    token = generateCSRFToken();
  }

  return token;
}

