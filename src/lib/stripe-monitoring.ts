/**
 * Stripe Integration Monitoring Utilities
 * 
 * Provides tracking and alerting for Stripe webhook events and subscription lifecycle.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { logger } from './logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface WebhookMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  retryingEvents: number;
  averageProcessingTime: number;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  trialSubscriptions: number;
}

/**
 * Get webhook delivery metrics from logs
 */
export async function getWebhookMetrics(
  startTime?: number,
  endTime?: number
): Promise<WebhookMetrics> {
  try {
    // This would query webhookLogs table
    // For now, return placeholder - actual implementation would query Convex
    return {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      retryingEvents: 0,
      averageProcessingTime: 0,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to get webhook metrics', { error: err.message });
    throw error;
  }
}

/**
 * Alert on webhook failures
 */
export function alertWebhookFailure(
  eventId: string,
  eventType: string,
  error: string,
  retryCount: number
): void {
  const alertMessage = `[STRIPE WEBHOOK ALERT] Failed to process webhook:
  - Event ID: ${eventId}
  - Event Type: ${eventType}
  - Error: ${error}
  - Retry Count: ${retryCount}
  - Timestamp: ${new Date().toISOString()}`;

  logger.error('Stripe webhook failure alert', {
    eventId,
    eventType,
    error,
    retryCount,
  });

  // In production, you would:
  // - Send to monitoring service (e.g., Sentry, Datadog)
  // - Send email/Slack notification
  // - Trigger incident response
}

/**
 * Track subscription lifecycle event
 */
export function trackSubscriptionLifecycle(
  userId: string,
  event: 'created' | 'updated' | 'cancelled' | 'renewed' | 'trial_started' | 'trial_ended',
  metadata?: Record<string, unknown>
): void {
  const logMessage = `[SUBSCRIPTION LIFECYCLE] ${event.toUpperCase()}:
  - User ID: ${userId}
  - Timestamp: ${new Date().toISOString()}
  ${metadata ? `- Metadata: ${JSON.stringify(metadata)}` : ''}`;

  logger.info('Subscription lifecycle event', {
    userId,
    event,
    metadata,
  });

  // In production, you would:
  // - Send to analytics service (PostHog, Mixpanel, etc.)
  // - Update metrics dashboard
  // - Trigger business logic (e.g., send welcome email)
}

/**
 * Check Stripe integration health
 */
export async function checkStripeHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  metrics: {
    recentWebhookFailures: number;
    averageProcessingTime: number;
  };
}> {
  const issues: string[] = [];
  let healthy = true;

  // Check environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('STRIPE_SECRET_KEY is not set');
    healthy = false;
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    issues.push('STRIPE_WEBHOOK_SECRET is not set');
    healthy = false;
  }

  if (!process.env.STRIPE_PRICE_ID_MONTHLY || !process.env.STRIPE_PRICE_ID_ANNUAL) {
    issues.push('Stripe price IDs are not configured');
    healthy = false;
  }

  // Check recent webhook failures (last hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentWebhookFailures = 0;
  const averageProcessingTime = 0;

  try {
    // Query webhook logs for recent failures
    // This is a placeholder - actual implementation would query Convex
    // const logs = await convex.query(api.queries.getRecentWebhookLogs, { since: oneHourAgo });
    // recentWebhookFailures = logs.filter(log => log.status === 'failed').length;
    // averageProcessingTime = logs.reduce((sum, log) => sum + (log.processingTimeMs || 0), 0) / logs.length;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to check webhook metrics', { error: err.message });
    issues.push('Unable to retrieve webhook metrics');
  }

  // Alert if too many failures
  if (recentWebhookFailures > 10) {
    issues.push(`High number of webhook failures in the last hour: ${recentWebhookFailures}`);
    healthy = false;
  }

  return {
    healthy,
    issues,
    metrics: {
      recentWebhookFailures,
      averageProcessingTime,
    },
  };
}

