import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Initialize Stripe client with a pinned stable API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Price IDs from environment
export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY!,
  ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL!,
} as const;

// Subscription status types
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing';

// Customer metadata interface
export interface CustomerMetadata {
  userId: string; // Clerk user ID
  email: string;
}

// Subscription data interface
export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}


