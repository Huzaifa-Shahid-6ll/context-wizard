import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET_EXPORT } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { logger } from '@/lib/logger';
import { RATE_LIMITS } from '../../../../../convex/lib/rateLimit';

// CRITICAL: Disable body parsing for webhooks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

// Security configuration
const MAX_WEBHOOK_AGE_SECONDS = 5 * 60; // 5 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Rate limiting is now handled by Convex - see checkRateLimit call below

// Helper function to retry Convex operations with exponential backoff
async function retryConvexOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context: { eventId: string; eventType: string }
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
      
      if (attempt < MAX_RETRIES) {
        logger.warn(`${operationName} failed, retrying`, {
          eventId: context.eventId,
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES + 1,
          delay,
          error: error instanceof Error ? error.message : String(error)
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`${operationName} failed after all retries`, {
          eventId: context.eventId,
          attempts: MAX_RETRIES + 1,
          error: errorMessage,
          stack: errorStack,
        });
      }
    }
  }
  
  throw lastError;
}

// Structured error logging helper
function logWebhookError(
  eventId: string,
  eventType: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error(`Error processing webhook event`, {
    eventId,
    eventType,
    error: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  let eventId = 'unknown';
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // Rate limiting using Convex
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit using Convex
    const rateLimitCheck = await convex.mutation(api.mutations.incrementRateLimit, {
      identifier: ip,
      action: 'webhook_request',
      limit: RATE_LIMITS.WEBHOOK_REQUESTS.count,
      windowMs: RATE_LIMITS.WEBHOOK_REQUESTS.windowMs,
    });
    
    if (!rateLimitCheck.allowed) {
      logger.error("Rate limit exceeded", { 
        requestId, 
        ip,
        count: rateLimitCheck.count,
        limit: RATE_LIMITS.WEBHOOK_REQUESTS.count,
      });
      
      // Log security event (using security.ts mutation)
      await convex.mutation(api.security.logSecurityEvent, {
        type: 'rate_limit_hit',
        userId: undefined,
        ip,
        fingerprint: req.headers.get('user-agent') || 'unknown',
        details: {
          action: 'webhook_request',
          count: rateLimitCheck.count,
          limit: RATE_LIMITS.WEBHOOK_REQUESTS.count,
        },
        severity: 'medium',
      });
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get raw body as text (CRITICAL for signature verification)
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error("Missing stripe-signature header", { requestId, ip });
      return NextResponse.json(
        { error: 'Missing signature', requestId },
        { status: 400 }
      );
    }

    // Verify webhook signature with enhanced error messages
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET_EXPORT
      );
      eventId = event.id; // Store event ID early for error handling
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorDetails = {
        requestId,
        ip,
        errorType: err instanceof Error ? err.constructor.name : 'Unknown',
        message,
        hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET_EXPORT,
        signatureLength: signature.length,
      };
      
      logger.error("Webhook signature verification failed", errorDetails);
      
      // Provide more specific error messages
      let errorMessage = 'Webhook signature verification failed';
      if (message.includes('No signatures found')) {
        errorMessage = 'Invalid signature format - no signatures found in header';
      } else if (message.includes('No webhook secret')) {
        errorMessage = 'Webhook secret not configured';
      } else if (message.includes('timestamp')) {
        errorMessage = 'Invalid signature timestamp';
      }
      
      return NextResponse.json(
        { error: errorMessage, requestId },
        { status: 400 }
      );
    }

    // Validate webhook timestamp (reject events older than 5 minutes)
    const eventAge = Date.now() / 1000 - event.created;
    if (eventAge > MAX_WEBHOOK_AGE_SECONDS) {
      logger.error("Rejected old webhook event", {
        requestId,
        eventId,
        age: eventAge.toFixed(0),
        maxAge: MAX_WEBHOOK_AGE_SECONDS
      });
      return NextResponse.json(
        { error: 'Webhook event too old', requestId, eventId },
        { status: 400 }
      );
    }

    // Log webhook event with ID, timestamp, and request ID
    const eventTimestamp = new Date(event.created * 1000).toISOString();
    logger.info("Processing webhook event", {
      requestId,
      eventId: event.id,
      eventType: event.type,
      timestamp: eventTimestamp,
      age: eventAge.toFixed(1)
    });

    // Helper to extract userId from event
    const extractUserId = (event: Stripe.Event): string | undefined => {
      const obj = event.data.object as { metadata?: { userId?: string }; client_reference_id?: string };
      return obj.metadata?.userId || obj.client_reference_id;
    };

    // Log webhook event start (non-blocking)
    const initialUserId = extractUserId(event);
    convex.mutation(api.mutations.logWebhookEvent, {
      eventId: event.id,
      eventType: event.type,
      status: 'retrying',
      userId: initialUserId,
      retryCount: 0,
      requestId,
    }).catch(err => {
      logger.error("Failed to log webhook event start", { requestId, error: err instanceof Error ? err.message : String(err) });
    });

    // Validate event type
    const supportedEventTypes = [
      'checkout.session.completed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ];

    if (!supportedEventTypes.includes(event.type)) {
      logger.warn("Unhandled event type", { eventId: event.id, eventType: event.type });
      // Return 200 for unhandled events to acknowledge receipt
      return NextResponse.json({ received: true, eventType: event.type });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get user ID from metadata
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          logWebhookError(event.id, event.type, new Error('No userId in checkout session'), {
            sessionId: session.id,
          });
          // Permanent failure - return 400
          return NextResponse.json(
            { error: 'Missing userId in checkout session' },
            { status: 400 }
          );
        }

        try {
          // Get subscription details
          const subscriptionId = session.subscription as string;
          if (!subscriptionId) {
            throw new Error('No subscription ID in checkout session');
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // current_period_end can be undefined immediately after session completion
          // Stripe docs: https://docs.stripe.com/api/subscriptions/object#subscription_object-current_period_end
          // Prefer current_period_end, then trial_end, otherwise fallback to +30 days
          const currentPeriodEndSec =
            typeof (subscription as any).current_period_end === 'number'
              ? Number((subscription as any).current_period_end)
              : typeof (subscription as any).trial_end === 'number' && (subscription as any).trial_end !== null
                ? Number((subscription as any).trial_end)
                : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

          // Update user in Convex with retry logic
          await retryConvexOperation(
            () => convex.mutation(api.mutations.updateUserSubscription, {
              userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodEnd: currentPeriodEndSec,
              cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
            }),
            'updateUserSubscription',
            { eventId: event.id, eventType: event.type }
          );

          logger.info("Subscription activated", { requestId, eventId: event.id, userId });

          // Emit payment_completed to PostHog (server-side)
          try {
            const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY; // using client key for capture
            const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
            if (apiKey) {
              const amountTotal = session.amount_total ?? 0;
              const amount = typeof amountTotal === 'number' ? amountTotal / 100 : 0;
              const currency = (session.currency || 'usd').toUpperCase();
              const plan = subscription.items.data[0]?.price?.nickname || subscription.items.data[0]?.price?.id;
              await fetch(`${host}/capture/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  api_key: apiKey,
                  event: 'payment_completed',
                  distinct_id: userId,
                  properties: {
                    plan,
                    amount,
                    currency,
                    billing_cycle: subscription.items.data[0]?.price?.recurring?.interval || 'monthly',
                    $set: { user_stage: 'paying_customer' },
                  },
                }),
              });
            }
          } catch (err) {
            // PostHog failures are non-critical, log but don't fail the webhook
            logger.error("Failed to emit PostHog payment_completed", { requestId, eventId: event.id, error: err instanceof Error ? err.message : String(err) });
          }
        } catch (error) {
          logWebhookError(event.id, event.type, error, { userId });
          // Retryable error - return 500 so Stripe retries
          throw error;
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Try multiple methods to extract userId
        let userId = subscription.metadata?.userId;
        
        // If not in subscription metadata, try customer metadata
        if (!userId && typeof subscription.customer === 'string') {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer);
            if (customer && !customer.deleted && 'metadata' in customer) {
              userId = customer.metadata?.userId;
            }
          } catch (err) {
            logger.warn("Failed to retrieve customer metadata", { requestId, eventId: event.id, error: err instanceof Error ? err.message : String(err) });
          }
        }
        
        // If still not found, try to get from checkout session that created this subscription
        if (!userId) {
          try {
            // Search for checkout sessions for this customer
            const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
            if (customerId) {
              const sessions = await stripe.checkout.sessions.list({
                customer: customerId,
                limit: 1,
              });
              if (sessions.data.length > 0) {
                const session = sessions.data[0];
                const clientReferenceId = session.client_reference_id;
                const extractedUserId = session.metadata?.userId || (clientReferenceId ? String(clientReferenceId) : undefined);
                if (extractedUserId) {
                  userId = extractedUserId;
                }
              }
            }
          } catch (err) {
            logger.warn("Failed to retrieve from checkout sessions", { requestId, eventId: event.id, error: err instanceof Error ? err.message : String(err) });
          }
        }

        if (!userId) {
          logWebhookError(event.id, event.type, new Error('No userId found in subscription metadata, customer metadata, or checkout sessions'), {
            subscriptionId: subscription.id,
            customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
          });
          // Permanent failure - return 400
          return NextResponse.json(
            { error: 'Missing userId - could not find in subscription metadata, customer metadata, or checkout sessions' },
            { status: 400 }
          );
        }

        try {
          // Update subscription status with retry logic
          // Ensure currentPeriodEnd is always a number to satisfy Convex validator
          // Stripe docs: https://docs.stripe.com/api/subscriptions/object#subscription_object-current_period_end
          const currentPeriodEndSec =
            typeof (subscription as any).current_period_end === 'number'
              ? Number((subscription as any).current_period_end)
              : typeof (subscription as any).trial_end === 'number' && (subscription as any).trial_end !== null
                ? Number((subscription as any).trial_end)
                : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

          await retryConvexOperation(
            () => convex.mutation(api.mutations.updateUserSubscription, {
              userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodEnd: currentPeriodEndSec,
              cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
            }),
            'updateUserSubscription',
            { eventId: event.id, eventType: event.type }
          );

          logger.info("Subscription updated", { requestId, eventId: event.id, userId });

          // Update user in PostHog as well
          try {
            const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
            const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
            if (apiKey) {
              await fetch(`${host}/capture/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  api_key: apiKey,
                  event: subscription.status === 'active' ? 'subscription_activated' : 'subscription_status_updated',
                  distinct_id: userId,
                  properties: {
                    subscription_status: subscription.status,
                    subscription_id: subscription.id,
                    price_id: subscription.items.data[0]?.price?.id,
                    current_period_end: (subscription as any).current_period_end,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                  },
                }),
              });
            }
          } catch (err) {
            logger.error("Failed to emit PostHog event", { requestId, eventId: event.id, error: err instanceof Error ? err.message : String(err) });
          }
        } catch (error) {
          logWebhookError(event.id, event.type, error, { userId, subscriptionId: subscription.id });
          // Retryable error - return 500 so Stripe retries
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          logWebhookError(event.id, event.type, new Error('No userId in subscription metadata'), {
            subscriptionId: subscription.id,
          });
          // Permanent failure - return 400
          return NextResponse.json(
            { error: 'Missing userId in subscription metadata' },
            { status: 400 }
          );
        }

        try {
          // Cancel subscription in database with retry logic
          await retryConvexOperation(
            () => convex.mutation(api.mutations.cancelUserSubscription, {
              userId,
            }),
            'cancelUserSubscription',
            { eventId: event.id, eventType: event.type }
          );

          logger.info("Subscription canceled", { requestId, eventId: event.id, userId });
        } catch (error) {
          logWebhookError(event.id, event.type, error, { userId, subscriptionId: subscription.id });
          // Retryable error - return 500 so Stripe retries
          throw error;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Payment succeeded - subscription is active
        logger.info("Payment succeeded", { requestId, eventId: event.id, invoiceId: invoice.id });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription: string | null };
        const subscription = invoice.subscription;

        if (subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscription as string);
            const userId = sub.metadata?.userId;

            if (userId) {
              // Mark subscription as past_due with retry logic
              await retryConvexOperation(
                () => convex.mutation(api.mutations.updateUserSubscription, {
                  userId,
                  subscriptionId: sub.id,
                  customerId: sub.customer as string,
                  priceId: sub.items.data[0].price.id,
                  status: 'past_due',
                  currentPeriodEnd: typeof (sub as any).current_period_end === 'number' ? (sub as any).current_period_end : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                  cancelAtPeriodEnd: !!sub.cancel_at_period_end,
                }),
                'updateUserSubscription',
                { eventId: event.id, eventType: event.type }
              );
            } else {
              logger.warn("No userId in subscription metadata for payment failed event", { requestId, eventId: event.id });
            }
          } catch (error) {
            logWebhookError(event.id, event.type, error, {
              invoiceId: invoice.id,
              subscriptionId: subscription as string,
            });
            // Retryable error - return 500 so Stripe retries
            throw error;
          }
        }

        logger.info("Payment failed", { requestId, eventId: event.id, invoiceId: invoice.id });
        break;
      }

      default:
        // This should not happen due to validation above, but keep for safety
        logger.warn("Unhandled event type", { requestId, eventId: event.id, eventType: event.type });
    }

    // Return 200 to acknowledge receipt
    const processingTime = Date.now() - startTime;
    const finalUserId = extractUserId(event);
    logger.info("Webhook successfully processed", {
      requestId,
      eventId: event.id,
      processingTimeMs: processingTime
    });
    
    // Log successful webhook processing (non-blocking)
    convex.mutation(api.mutations.logWebhookEvent, {
      eventId: event.id,
      eventType: event.type,
      status: 'success',
      userId: finalUserId,
      retryCount: 0,
      requestId,
      processingTimeMs: processingTime,
    }).catch(err => {
      logger.error("Failed to log webhook success", { requestId, error: err instanceof Error ? err.message : String(err) });
    });
    
    return NextResponse.json({ 
      received: true, 
      eventId: event.id,
      requestId,
      processingTimeMs: processingTime,
    });
  } catch (error: unknown) {
    const processingTime = Date.now() - startTime;
    logWebhookError(eventId, 'unknown', error, { requestId, processingTimeMs: processingTime });
    
    // Log failed webhook processing (non-blocking)
    const errorMessage = error instanceof Error ? error.message : String(error);
    convex.mutation(api.mutations.logWebhookEvent, {
      eventId,
      eventType: 'unknown',
      status: 'failed',
      userId: undefined,
      errorMessage,
      retryCount: 0,
      requestId,
      processingTimeMs: processingTime,
    }).catch(err => {
      logger.error("Failed to log webhook failure", { requestId, error: err instanceof Error ? err.message : String(err) });
    });
    
    // Return 500 for retryable errors (Stripe will retry)
    return NextResponse.json(
      { error: 'Webhook handler failed', eventId, requestId },
      { status: 500 }
    );
  }
}


