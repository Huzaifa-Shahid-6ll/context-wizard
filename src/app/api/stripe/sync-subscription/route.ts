import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { stripe } from '@/lib/stripe';
import { createSafeErrorResponse } from '@/lib/errorMessages';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's subscription from our database
    const userResponse = await convex.query(api.queries.getUserByClerkId, { clerkId: userId });
    if (!userResponse) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResponse as any; // Type assertion for the user object
    
    if (!user.stripeCustomerId) {
      return Response.json({ error: 'No Stripe customer ID found for this user' }, { status: 400 });
    }

    // Fetch the latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription, reset user to free tier
      await convex.mutation(api.mutations.cancelUserSubscription, { userId });
      return Response.json({
        message: 'No subscription found, user reset to free tier',
        subscriptionStatus: 'none'
      });
    }

    const subscription = subscriptions.data[0];
    
    // Entitlement policy: treat active, trialing, and past_due as pro until cancellation
    const proStatuses = ["active", "trialing", "past_due"];
    const isPro = proStatuses.includes(subscription.status);

    // Update the user's subscription status in our database
    await convex.mutation(api.mutations.updateUserSubscription, {
      userId,
      subscriptionId: subscription.id,
      customerId: user.stripeCustomerId,
      priceId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    });

    return Response.json({
      message: 'Subscription synced successfully',
      subscription: {
        status: subscription.status,
        isPro,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      }
    });

  } catch (error) {
    console.error('Error syncing subscription:', error);
    const errorResponse = createSafeErrorResponse(error);
    return Response.json(errorResponse.error, { status: 500 });
  }
}