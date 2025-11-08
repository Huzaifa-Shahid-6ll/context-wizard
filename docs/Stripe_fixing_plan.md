Based on my comprehensive analysis of the Stripe implementation, here is the complete documentation for improving the Stripe integration:

  Stripe Documentation and Improvement Guide

  Current System Overview

  The application implements a subscription-based payment system using Stripe with the following components:

   - Checkout Flow: /api/stripe/checkout - Creates Stripe checkout sessions
   - Customer Portal: /api/stripe/portal - Creates customer billing portal sessions
   - Webhook Handler: /api/webhooks/stripe - Handles subscription events
   - Frontend Components: Billing page with upgrade/cancel functionality
   - Database: Convex tables for user subscription data
   - Client Library: Stripe.js for frontend integration

  Current Stripe Integration Flow

   1. User initiates checkout on the frontend
   2. /api/stripe/checkout creates a Stripe checkout session
   3. After payment, Stripe sends webhook events to update subscription status
   4. Subscription changes are stored in Convex
   5. Users can manage billing through the Stripe customer portal

  Issues Identified and Recommended Improvements

  1. Missing Cancel Endpoint
  Issue: The billing page calls /api/stripe/cancel but this endpoint doesn't exist.
  Solution: Create the missing endpoint to handle subscription cancellation.

  Implementation:

    1 // src/app/api/stripe/cancel/route.ts
    2 import { NextRequest, NextResponse } from 'next/server';
    3 import { auth } from '@clerk/nextjs/server';
    4 import { stripe } from '@/lib/stripe';
    5 import { ConvexHttpClient } from 'convex/browser';
    6 import { api } from '../../../../../convex/_generated/api';
    7
    8 export const runtime = 'nodejs';
    9
   10 const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
   11
   12 export async function POST(req: NextRequest) {
   13   try {
   14     const { userId } = await auth();
   15     if (!userId) {
   16       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   17     }
   18
   19     const user = await convex.query(api.queries.getUserByClerkId, {
   20       clerkId: userId,
   21     });
   22
   23     if (!user?.stripeSubscriptionId) {
   24       return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
   25     }
   26
   27     // Cancel subscription in Stripe
   28     const cancelledSubscription = await stripe.subscriptions.update(
   29       user.stripeSubscriptionId,
   30       { cancel_at_period_end: true }
   31     );
   32
   33     // Update in Convex
   34     await convex.mutation(api.mutations.updateUserSubscription, {
   35       userId: user.clerkId,
   36       subscriptionId: cancelledSubscription.id,
   37       customerId: String(cancelledSubscription.customer),
   38       priceId: cancelledSubscription.items.data[0]?.price?.id,
   39       status: cancelledSubscription.status,
   40       currentPeriodEnd: cancelledSubscription.current_period_end,
   41       cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
   42     });
   43
   44     return NextResponse.json({ success: true });
   45   } catch (error: unknown) {
   46     console.error('Cancel subscription error:', error);
   47     return NextResponse.json(
   48       { error: 'Failed to cancel subscription' },
   49       { status: 500 }
   50     );
   51   }
   52 }

  2. Enhanced Error Handling for Webhooks

  Current Issue: The webhook handler has basic error handling but could be more robust.

  Improvements:
   - Add retry logic for failed Convex operations
   - Implement proper error logging
   - Add webhook ID and timestamp tracking
   - Implement dead letter queue for persistent failures

    1 // Improved webhook handler
    2 export async function POST(req: NextRequest) {
    3   try {
    4     const body = await req.text();
    5     const headersList = await headers();
    6     const signature = headersList.get('stripe-signature');
    7
    8     if (!signature) {
    9       console.error('Missing stripe-signature header');
   10       return NextResponse.json(
   11         { error: 'Missing signature' },
   12         { status: 400 }
   13       );
   14     }
   15
   16     let event: Stripe.Event;
   17     try {
   18       event = stripe.webhooks.constructEvent(
   19         body,
   20         signature,
   21         process.env.STRIPE_WEBHOOK_SECRET!
   22       );
   23     } catch (err: unknown) {
   24       const message = err instanceof Error ? err.message : String(err);
   25       console.error(`Webhook signature verification failed: ${message}`);
   26       console.error('Raw body:', body);
   27       return NextResponse.json(
   28         { error: `Webhook Error: ${message}` },
   29         { status: 400 }
   30       );
   31     }
   32
   33     console.log(`Processing webhook event: ${event.type} (${event.id}) at ${new Date(event.created * 1000).toISOString()}`);
   34
   35     // Handle different event types
   36     switch (event.type) {
   37       case 'checkout.session.completed': {
   38         await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
   39         break;
   40       }
   41       case 'customer.subscription.updated': {
   42         await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
   43         break;
   44       }
   45       case 'customer.subscription.deleted': {
   46         await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
   47         break;
   48       }
   49       case 'invoice.payment_succeeded': {
   50         await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
   51         break;
   52       }
   53       case 'invoice.payment_failed': {
   54         await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
   55         break;
   56       }
   57       default:
   58         console.log(`Unhandled event type: ${event.type}`);
   59         break;
   60     }
   61
   62     return NextResponse.json({ received: true });
   63   } catch (error: unknown) {
   64     console.error('Webhook handler error:', error);
   65     // Consider returning 500 to indicate temporary failure so Stripe retries
   66     return NextResponse.json(
   67       { error: 'Webhook handler failed' },
   68       { status: 500 }
   69     );
   70   }
   71 }
   72
   73 // Separate handler functions for better maintainability
   74 async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
   75   // Implementation here
   76 }
   77
   78 async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
   79   // Implementation here
   80 }

  3. Stripe Configuration Improvements

  Current Issues:
   - API version is hardcoded
   - No proper secret validation
   - Missing webhook endpoint registration

  Recommended Configuration:

    1 // Enhanced stripe.ts
    2 import Stripe from 'stripe';
    3
    4 if (!process.env.STRIPE_SECRET_KEY) {
    5   throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
    6 }
    7
    8 if (!process.env.STRIPE_WEBHOOK_SECRET) {
    9   throw new Error('Missing required environment variable: STRIPE_WEBHOOK_SECRET');
   10 }
   11
   12 // Use latest stable API version
   13 export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
   14   apiVersion: '2024-11-20.acacia', // or latest stable version
   15   typescript: true,
   16   timeout: 30000,
   17   maxNetworkRetries: 2,
   18 });
   19
   20 // Add webhook verification helper
   21 export const verifyWebhookSignature = (body: string, signature: string | null) => {
   22   if (!signature) {
   23     throw new Error('Missing signature header');
   24   }
   25
   26   try {
   27     return stripe.webhooks.constructEvent(
   28       body,
   29       signature,
   30       process.env.STRIPE_WEBHOOK_SECRET!
   31     );
   32   } catch (err) {
   33     console.error('Webhook signature verification failed:', err);
   34     throw err;
   35   }
   36 };
   37
   38 export const STRIPE_PRICES = {
   39   MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY!,
   40   ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL!,
   41 } as const;
   42
   43 // Validate required environment variables at startup
   44 export const validateStripeConfig = () => {
   45   const requiredEnv = [
   46     'STRIPE_SECRET_KEY',
   47     'STRIPE_WEBHOOK_SECRET',
   48     'STRIPE_PRICE_ID_MONTHLY',
   49     'STRIPE_PRICE_ID_ANNUAL',
   50     'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
   51     'NEXT_PUBLIC_SITE_URL',
   52   ];
   53
   54   const missing = requiredEnv.filter(env => !process.env[env]);
   55   if (missing.length > 0) {
   56     throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
   57   }
   58 };

  4. Enhanced Checkout Flow

  Current Issue: No validation or fallback logic for checkout sessions.

  Improved Implementation:

    1 // Enhanced checkout route
    2 export async function POST(req: NextRequest) {
    3   try {
    4     const { userId } = await auth();
    5
    6     if (!userId) {
    7       return NextResponse.json(
    8         { error: 'Unauthorized' },
    9         { status: 401 }
   10       );
   11     }
   12
   13     const body = await req.json();
   14     const { priceId, billingPeriod = 'monthly', successCallback, cancelCallback } = body ?? {};
   15
   16     // Validate price ID
   17     const selectedPriceId = priceId || (
   18       billingPeriod === 'annual'
   19         ? STRIPE_PRICES.ANNUAL
   20         : STRIPE_PRICES.MONTHLY
   21     );
   22
   23     // Verify price exists in Stripe
   24     try {
   25       await stripe.prices.retrieve(selectedPriceId);
   26     } catch (err) {
   27       console.error('Invalid price ID:', selectedPriceId);
   28       return NextResponse.json(
   29         { error: 'Invalid pricing option' },
   30         { status: 400 }
   31       );
   32     }
   33
   34     // Get user data for customer creation
   35     const user = await convex.query(api.queries.getUserByClerkId, {
   36       clerkId: userId,
   37     });
   38
   39     let customer: string | undefined;
   40     if (user?.stripeCustomerId) {
   41       customer = user.stripeCustomerId;
   42     }
   43
   44     const session = await stripe.checkout.sessions.create({
   45       mode: 'subscription',
   46       payment_method_types: ['card'],
   47       line_items: [
   48         {
   49           price: selectedPriceId,
   50           quantity: 1,
   51         },
   52       ],
   53       success_url: successCallback || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
   54       cancel_url: cancelCallback || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`,
   55       customer,
   56       customer_email: user?.email, // Use existing user's email
   57       client_reference_id: userId,
   58       metadata: {
   59         userId,
   60       },
   61       subscription_data: {
   62         metadata: {
   63           userId,
   64         },
   65       },
   66       allow_promotion_codes: true,
   67     });
   68
   69     return NextResponse.json({
   70       url: session.url,
   71       sessionId: session.id,
   72     });
   73   } catch (error: unknown) {
   74     console.error('Stripe checkout error:', error);
   75     const message = error instanceof Error ? error.message : 'Unknown error';
   76     return NextResponse.json(
   77       { error: message },
   78       { status: 500 }
   79     );
   80   }
   81 }

  5. Frontend Stripe Integration Improvements

  Current Issue: The frontend doesn't handle Stripe loading errors gracefully.

  Enhanced Implementation:

    1 // Enhanced stripe-client.ts
    2 import { loadStripe, Stripe } from '@stripe/stripe-js';
    3
    4 let stripePromise: Promise<Stripe | null> | null = null;
    5
    6 export const getStripe = () => {
    7   if (!stripePromise) {
    8     stripePromise = loadStripe(
    9       process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
   10     ).catch((error) => {
   11       console.error('Failed to load Stripe:', error);
   12       return null;
   13     });
   14   }
   15   return stripePromise;
   16 };
   17
   18 // Enhanced billing page error handling
   19 const handleUpgrade = async () => {
   20   try {
   21     const stripe = await getStripe();
   22     if (!stripe) {
   23       toast.error('Payment system is temporarily unavailable');
   24       trackEvent('payment_failed', { error_type: 'stripe_not_loaded' });
   25       return;
   26     }
   27
   28     trackEvent('upgrade_button_clicked', { location: 'billing_page' });
   29     trackEvent('payment_initiated');
   30
   31     const response = await fetch('/api/stripe/checkout', {
   32       method: 'POST',
   33       headers: { 'Content-Type': 'application/json' },
   34       body: JSON.stringify({ billingPeriod: 'monthly' }),
   35     });
   36
   37     if (!response.ok) {
   38       const errorData = await response.json();
   39       throw new Error(errorData.error || 'Failed to start checkout');
   40     }
   41
   42     const { url } = await response.json();
   43     if (!url) throw new Error('Missing checkout URL');
   44
   45     window.location.href = url;
   46   } catch (error) {
   47     console.error('Upgrade error:', error);
   48     toast.error('Failed to start checkout. Please try again.');
   49     trackEvent('payment_failed', {
   50       error_type: 'checkout_start',
   51       error_message: error instanceof Error ? error.message : 'Unknown error'
   52     });
   53   }
   54 };

  6. Database Schema Improvements

  Consider adding webhook tracking for better debugging:

    1 // Additional schema fields in Convex
    2 const webhookLogs = defineTable({
    3   stripeEventId: v.string(),        // Stripe's event ID
    4   eventType: v.string(),            // The event type (e.g. "customer.subscription.updated")
    5   processedAt: v.number(),          // When we processed this event
    6   processed: v.boolean(),           // Whether we successfully processed
    7   errorMessage: v.optional(v.string()), // Error if processing failed
    8   payload: v.optional(v.any()),     // The raw event payload
    9   createdAt: v.number(),
   10 }).index("by_stripeEventId", ["stripeEventId"])
   11  .index("by_eventType", ["eventType"])
   12  .index("by_processedAt", ["processedAt"]);
   13
   14 // Add to schema export
   15 export default defineSchema({
   16   users,
   17   generations,
   18   prompts,
   19   promptAnalyses,
   20   outputPredictions,
   21   securityEvents,
   22   bannedIps,
   23   contextMemory,
   24   promptTemplates,
   25   structuredInputTemplates,
   26   userPreferences,
   27   formSubmissions,
   28   feedback,
   29   onboardingResponses,
   30   affiliateClicks,
   31   webhookLogs, // Add webhook logging table
   32 });

  7. Testing Documentation

  Create comprehensive tests for Stripe integration:

    1 // Example test file: __tests__/stripe.test.ts
    2 import { stripe } from '@/lib/stripe';
    3
    4 describe('Stripe Integration', () => {
    5   describe('Webhook Handling', () => {
    6     test('should handle valid checkout.session.completed events', async () => {
    7       // Create a mock event
    8       const mockEvent = {
    9         id: 'evt_123',
   10         type: 'checkout.session.completed',
   11         data: {
   12           object: {
   13             id: 'cs_123',
   14             subscription: 'sub_123',
   15             metadata: { userId: 'user_123' },
   16             client_reference_id: 'user_123'
   17           }
   18         }
   19       };
   20
   21       // Test that webhook processing succeeds
   22       // Implementation depends on your test setup
   23     });
   24
   25     test('should reject invalid webhook signatures', async () => {
   26       // Test signature verification
   27     });
   28   });
   29
   30   describe('Checkout Session Creation', () => {
   31     test('should create valid checkout sessions', async () => {
   32       // Test checkout session creation
   33     });
   34   });
   35 });

  8. Environment Variables Documentation

  .env.local should contain:

    1 # Stripe API
    2 STRIPE_SECRET_KEY=sk_test_...
    3 STRIPE_WEBHOOK_SECRET=whsec_...
    4 STRIPE_PRICE_ID_MONTHLY=price_...
    5 STRIPE_PRICE_ID_ANNUAL=price_...
    6
    7 # Stripe Frontend
    8 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    9
   10 # Application
   11 NEXT_PUBLIC_SITE_URL=https://yourapp.com

  9. Security Best Practices

   1. Webhook Security: Always verify webhook signatures
   2. API Key Security: Never expose secret keys in frontend code
   3. Rate Limiting: Implement rate limiting for checkout endpoints
   4. Input Validation: Validate all user input and Stripe data
   5. Error Handling: Don't expose sensitive error information to users

  10. Monitoring and Observability

  Add logging and monitoring for Stripe events:
   - Track successful/failed webhook deliveries
   - Monitor checkout conversion rates
   - Log subscription lifecycle events
   - Create alerts for webhook failures

  This comprehensive documentation outlines all the improvements needed for a robust, scalable, and maintainable Stripe integration.

> Generate a Plan to implement these improvements but first tell me which Documentation from Stripe Docs should i provide to aid you in this.

✦ Before I create a detailed implementation plan, I'd like to reference specific parts of the Stripe documentation that would be most helpful for this
  project. The most relevant documentation sections would be:

  Key Stripe Documentation Topics to Provide:

   1. Webhook Best Practices - Proper signature verification, retry logic, and idempotency
      - Webhook signature verification (https://stripe.com/docs/webhooks/signatures)
      - Webhook configuration and testing (https://stripe.com/docs/webhooks/test)
      - Webhook endpoint best practices (https://stripe.com/docs/webhooks/best-practices)

   2. Checkout Session API - Complete reference for subscription checkout
      - Checkout Sessions API reference (https://stripe.com/docs/api/checkout/sessions)
      - Subscription checkout integration guide (https://stripe.com/docs/checkout/subscription)
      - Checkout session configuration options (https://stripe.com/docs/api/checkout/sessions/create)

   3. Customer Portal Integration - Billing management for customers
      - Customer portal sessions API (https://stripe.com/docs/api/customer_portal)
      - Portal configuration options (https://stripe.com/docs/billing/customer-portal/integrate)

   4. Subscription Management - Complete lifecycle handling
      - Subscription API reference (https://stripe.com/docs/api/subscriptions)
      - Subscription lifecycle guide (https://stripe.com/docs/billing/subscriptions/lifecycle)
      - Subscription cancellation best practices (https://stripe.com/docs/billing/subscriptions/cancel)

   5. Typescript SDK Documentation - Proper integration with TypeScript
      - Node.js Stripe library (https://stripe.com/docs/libraries#nodejs-library)
      - TypeScript integration guide (https://stripe.com/docs/libraries/typescript)

   6. API Versioning and Security - Best practices for API usage
      - API versioning guide (https://stripe.com/docs/api/versioning)
      - Security best practices (https://stripe.com/docs/security/guide)

   7. Testing and Integration - Proper test setup
      - Testing integration (https://stripe.com/docs/billing/subscriptions/test)
      - Stripe CLI for testing webhooks (https://stripe.com/docs/stripe-cli)