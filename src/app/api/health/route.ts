/**
 * Health Check API Endpoint
 * 
 * Provides comprehensive health checks for all external services
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getApiKey } from '@/lib/openrouter';
import { getGeminiApiKey } from '@/lib/gemini';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface ApiKeyHealth {
  present: boolean;
  validFormat: boolean;
}

/**
 * Check Convex health
 */
async function checkConvexHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Simple query to check Convex connectivity
    await convex.query(api.queries.getUserByClerkId, { clerkId: 'health-check' });
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'convex',
      status: 'healthy',
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    // If user not found, that's fine - it means Convex is responding
    if (error.message?.includes('not found') || error.message?.includes('User not found')) {
      return {
        service: 'convex',
        status: 'healthy',
        responseTime,
      };
    }
    
    return {
      service: 'convex',
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check OpenRouter health
 */
async function checkOpenRouterHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const apiKey = getApiKey('free');
    if (!apiKey) {
      return {
        service: 'openrouter',
        status: 'unhealthy',
        error: 'API key not configured',
      };
    }

    // Make a minimal health check request
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: 'openrouter',
        status: 'healthy',
        responseTime,
      };
    } else if (response.status === 401) {
      return {
        service: 'openrouter',
        status: 'unhealthy',
        responseTime,
        error: 'Invalid API key',
      };
    } else {
      return {
        service: 'openrouter',
        status: 'degraded',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      service: 'openrouter',
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Connection failed',
    };
  }
}

/**
 * Check Gemini health
 */
async function checkGeminiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const apiKey = getGeminiApiKey('free');
    if (!apiKey) {
      return {
        service: 'gemini',
        status: 'unhealthy',
        error: 'API key not configured',
      };
    }

    // Make a minimal health check request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: 'gemini',
        status: 'healthy',
        responseTime,
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        service: 'gemini',
        status: 'unhealthy',
        responseTime,
        error: 'Invalid API key',
      };
    } else {
      return {
        service: 'gemini',
        status: 'degraded',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      service: 'gemini',
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Connection failed',
    };
  }
}

/**
 * Check Stripe health
 */
async function checkStripeHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Make a minimal API call to check Stripe connectivity
    await stripe.customers.list({ limit: 1 });
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'stripe',
      status: 'healthy',
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Check if it's an authentication error
    if (error.type === 'StripeAuthenticationError') {
      return {
        service: 'stripe',
        status: 'unhealthy',
        responseTime,
        error: 'Invalid API key',
      };
    }
    
    return {
      service: 'stripe',
      status: 'degraded',
      responseTime,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check API key format (non-empty string)
 */
function checkApiKeyFormat(key: string | undefined): ApiKeyHealth {
  return {
    present: !!key,
    validFormat: !!key && typeof key === 'string' && key.trim().length > 0,
  };
}

/**
 * GET /api/health
 * Returns health status of all external services
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Check if detailed health check is requested
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';
  const checkAuth = url.searchParams.get('checkAuth') === 'true'; // Optional auth check flag
  
  // Check API keys format
  const apiKeyHealth = {
    openrouter_free: checkApiKeyFormat(getApiKey('free')),
    openrouter_pro: checkApiKeyFormat(getApiKey('pro')),
    gemini_free: checkApiKeyFormat(getGeminiApiKey('free')),
    gemini_pro: checkApiKeyFormat(getGeminiApiKey('pro')),
  };

  // If checkAuth is enabled, attempt light authenticated requests
  if (checkAuth) {
    // Optional: Make HEAD requests to validate keys (if supported by providers)
    // For now, we'll just return the format checks
  }
  
  // Run all health checks in parallel (if detailed)
  let results: HealthCheckResult[] = [];
  if (detailed) {
    const [convexHealth, openRouterHealth, geminiHealth, stripeHealth] = await Promise.allSettled([
      checkConvexHealth(),
      checkOpenRouterHealth(),
      checkGeminiHealth(),
      checkStripeHealth(),
    ]);

    if (convexHealth.status === 'fulfilled') {
      results.push(convexHealth.value);
    } else {
      results.push({
        service: 'convex',
        status: 'unhealthy',
        error: convexHealth.reason?.message || 'Check failed',
      });
    }

    if (openRouterHealth.status === 'fulfilled') {
      results.push(openRouterHealth.value);
    } else {
      results.push({
        service: 'openrouter',
        status: 'unhealthy',
        error: openRouterHealth.reason?.message || 'Check failed',
      });
    }

    if (geminiHealth.status === 'fulfilled') {
      results.push(geminiHealth.value);
    } else {
      results.push({
        service: 'gemini',
        status: 'unhealthy',
        error: geminiHealth.reason?.message || 'Check failed',
      });
    }

    if (stripeHealth.status === 'fulfilled') {
      results.push(stripeHealth.value);
    } else {
      results.push({
        service: 'stripe',
        status: 'unhealthy',
        error: stripeHealth.reason?.message || 'Check failed',
      });
    }
  }

  const totalTime = Date.now() - startTime;

  const response = {
    ...apiKeyHealth,
    ...(detailed && { services: results }),
    timestamp: new Date().toISOString(),
    responseTime: totalTime,
  };

  // Return 200 if all keys are present and valid format
  const allValid = Object.values(apiKeyHealth).every(k => k.present && k.validFormat);
  const statusCode = allValid ? 200 : 207; // 207 Multi-Status if some keys missing

  return NextResponse.json(response, { status: statusCode });
}

