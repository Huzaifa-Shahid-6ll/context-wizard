import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

// CRITICAL: Disable body parsing for webhooks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Get raw body as text (CRITICAL for signature verification)
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Webhook signature verification failed: ${message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get user ID from metadata
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          console.error('No userId in checkout session');
          break;
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update user in Convex
        await convex.mutation(api.mutations.updateUserSubscription, {
          userId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        console.log(`Subscription activated for user ${userId}`);

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
          console.error('Failed to emit PostHog payment_completed', err);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Update subscription status
        await convex.mutation(api.mutations.updateUserSubscription, {
          userId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        console.log(`Subscription updated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Cancel subscription in database
        await convex.mutation(api.mutations.cancelUserSubscription, {
          userId,
        });

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Payment succeeded - subscription is active
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;

        if (subscription) {
          const sub = await stripe.subscriptions.retrieve(subscription as string);
          const userId = sub.metadata?.userId;

          if (userId) {
            // Mark subscription as past_due
            await convex.mutation(api.mutations.updateUserSubscription, {
              userId,
              subscriptionId: sub.id,
              customerId: sub.customer as string,
              priceId: sub.items.data[0].price.id,
              status: 'past_due',
              currentPeriodEnd: sub.current_period_end,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            });
          }
        }

        console.log(`Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}


