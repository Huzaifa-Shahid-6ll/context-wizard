import { NextRequest, NextResponse } from 'next/server';
import { checkStripeHealth } from '@/lib/stripe-monitoring';

export const runtime = 'nodejs';

/**
 * Health check endpoint for Stripe integration
 * GET /api/stripe/health
 */
export async function GET(_req: NextRequest) {
  try {
    const health = await checkStripeHealth();
    
    return NextResponse.json(health, {
      status: health.healthy ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        healthy: false,
        issues: ['Health check failed'],
        metrics: {
          recentWebhookFailures: 0,
          averageProcessingTime: 0,
        },
      },
      { status: 503 }
    );
  }
}

