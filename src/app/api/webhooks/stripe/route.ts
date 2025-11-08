import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET_EXPORT } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

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

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Rate limiting helper
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

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
        console.warn(
          `[Webhook ${context.eventId}] ${operationName} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
          error instanceof Error ? error.message : String(error)
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(
          `[Webhook ${context.eventId}] ${operationName} failed after ${MAX_RETRIES + 1} attempts:`,
          error instanceof Error ? error.message : String(error),
          error instanceof Error ? error.stack : undefined
        );
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
  
  console.error(`[Webhook ${eventId}] Error processing ${eventType}:`, {
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
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      console.error(`[Request ${requestId}] Rate limit exceeded for IP: ${ip}`);
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
      console.error(`[Request ${requestId}] Missing stripe-signature header from IP: ${ip}`);
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
      
      console.error(`[Request ${requestId}] Webhook signature verification failed:`, errorDetails);
      
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
      console.error(
        `[Request ${requestId}] [Webhook ${eventId}] Rejected old webhook event: ${eventAge.toFixed(0)}s old (max: ${MAX_WEBHOOK_AGE_SECONDS}s)`
      );
      return NextResponse.json(
        { error: 'Webhook event too old', requestId, eventId },
        { status: 400 }
      );
    }

    // Log webhook event with ID, timestamp, and request ID
    const eventTimestamp = new Date(event.created * 1000).toISOString();
    console.log(
      `[Request ${requestId}] [Webhook ${event.id}] Processing event: ${event.type} at ${eventTimestamp} (age: ${eventAge.toFixed(1)}s)`
    );

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
      console.error(`[Request ${requestId}] Failed to log webhook event start:`, err);
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
      console.log(`[Webhook ${event.id}] Unhandled event type: ${event.type}`);
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

          // Update user in Convex with retry logic
          await retryConvexOperation(
            () => convex.mutation(api.mutations.updateUserSubscription, {
              userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodEnd: subscription.items.data[0]?.current_period_end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }),
            'updateUserSubscription',
            { eventId: event.id, eventType: event.type }
          );

          console.log(`[Request ${requestId}] [Webhook ${event.id}] Subscription activated for user ${userId}`);

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
            console.error(`[Request ${requestId}] [Webhook ${event.id}] Failed to emit PostHog payment_completed:`, err);
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
          // Update subscription status with retry logic
          await retryConvexOperation(
            () => convex.mutation(api.mutations.updateUserSubscription, {
              userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodEnd: subscription.items.data[0]?.current_period_end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }),
            'updateUserSubscription',
            { eventId: event.id, eventType: event.type }
          );

          console.log(`[Request ${requestId}] [Webhook ${event.id}] Subscription updated for user ${userId}`);
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

          console.log(`[Request ${requestId}] [Webhook ${event.id}] Subscription canceled for user ${userId}`);
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
        console.log(`[Request ${requestId}] [Webhook ${event.id}] Payment succeeded for invoice ${invoice.id}`);
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
                  currentPeriodEnd: sub.items.data[0]?.current_period_end,
                  cancelAtPeriodEnd: sub.cancel_at_period_end,
                }),
                'updateUserSubscription',
                { eventId: event.id, eventType: event.type }
              );
            } else {
              console.warn(`[Request ${requestId}] [Webhook ${event.id}] No userId in subscription metadata for payment failed event`);
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

        console.log(`[Request ${requestId}] [Webhook ${event.id}] Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        // This should not happen due to validation above, but keep for safety
        console.log(`[Request ${requestId}] [Webhook ${event.id}] Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    const processingTime = Date.now() - startTime;
    const finalUserId = extractUserId(event);
    console.log(
      `[Request ${requestId}] [Webhook ${event.id}] Successfully processed in ${processingTime}ms`
    );
    
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
      console.error(`[Request ${requestId}] Failed to log webhook success:`, err);
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
      console.error(`[Request ${requestId}] Failed to log webhook failure:`, err);
    });
    
    // Return 500 for retryable errors (Stripe will retry)
    return NextResponse.json(
      { error: 'Webhook handler failed', eventId, requestId },
      { status: 500 }
    );
  }
}


