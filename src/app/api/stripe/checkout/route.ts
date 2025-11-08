import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export const runtime = 'nodejs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { priceId, billingPeriod = 'monthly' } = body ?? {};

    // Determine price ID
    const selectedPriceId = priceId || (
      billingPeriod === 'annual'
        ? STRIPE_PRICES.ANNUAL
        : STRIPE_PRICES.MONTHLY
    );

    // Validate price ID exists in Stripe
    try {
      const price = await stripe.prices.retrieve(selectedPriceId);
      if (!price.active) {
        return NextResponse.json(
          { error: 'Selected pricing option is not available' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Invalid price ID:', selectedPriceId, error);
      return NextResponse.json(
        { error: 'Invalid pricing option selected' },
        { status: 400 }
      );
    }

    // Get user from Convex to retrieve existing customer and email
    let customerId: string | undefined;
    let customerEmail: string | undefined;
    
    try {
      const user = await convex.query(api.queries.getUserByClerkId, {
        clerkId: userId,
      });
      
      if (user?.stripeCustomerId) {
        customerId = user.stripeCustomerId;
      }
      if (user?.email) {
        customerEmail = user.email;
      }
    } catch (error) {
      // Non-critical - continue without customer info
      console.warn('Failed to retrieve user data for checkout:', error);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin')}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin')}/dashboard/billing?canceled=true`,
      customer: customerId, // Use existing customer if available
      customer_email: customerEmail || undefined, // Pre-fill email if available
      client_reference_id: userId, // Link to our user
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      allow_promotion_codes: true, // Let users add promo codes
    });

    if (!session.url) {
      throw new Error('Checkout session created but no URL returned');
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stripe checkout error:', error);
    
    // Provide more specific error messages
    let errorMessage = message || 'Failed to create checkout session';
    if (message.includes('No such price')) {
      errorMessage = 'Invalid pricing option. Please try again.';
    } else if (message.includes('Invalid API Key')) {
      errorMessage = 'Payment system configuration error. Please contact support.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


