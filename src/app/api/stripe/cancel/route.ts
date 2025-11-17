import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { createSafeErrorResponse } from '@/lib/errorMessages';

export const runtime = 'nodejs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Convex to find Stripe subscription ID
    const user = await convex.query(api.queries.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe (set to cancel at period end)
    const cancelledSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update in Convex
    await convex.mutation(api.mutations.updateUserSubscription, {
      userId: user.clerkId,
      subscriptionId: cancelledSubscription.id,
      customerId: cancelledSubscription.customer as string,
      priceId: cancelledSubscription.items.data[0]?.price?.id || user.stripePriceId || '',
      status: cancelledSubscription.status,
      currentPeriodEnd: cancelledSubscription.items.data[0]?.current_period_end as number,
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end as boolean,
    });

    return NextResponse.json({ 
      success: true,
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
    });
  } catch (error: unknown) {
    console.error('Cancel subscription error:', error);
    const errorResponse = createSafeErrorResponse(error);
    return NextResponse.json(
      errorResponse.error,
      { status: 500 }
    );
  }
}

