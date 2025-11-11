import Stripe from 'stripe';

// Expected Stripe API version
const EXPECTED_API_VERSION = '2025-10-29.clover';

// Helper function to validate required environment variables
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please set ${name} in your environment configuration.`
    );
  }
  return value;
}

// Helper function to validate Stripe secret key format
function validateStripeSecretKey(key: string): void {
  if (!key.startsWith('sk_')) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY format. Stripe secret keys must start with "sk_". ' +
      'Please check your environment configuration.'
    );
  }
}

// Helper function to validate Stripe webhook secret format
function validateWebhookSecret(secret: string): void {
  if (!secret.startsWith('whsec_')) {
    throw new Error(
      'Invalid STRIPE_WEBHOOK_SECRET format. Webhook secrets must start with "whsec_". ' +
      'Please check your environment configuration.'
    );
  }
}

// Validate all required environment variables
const STRIPE_SECRET_KEY = validateEnvVar('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
validateStripeSecretKey(STRIPE_SECRET_KEY);

const STRIPE_WEBHOOK_SECRET = validateEnvVar('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET);
validateWebhookSecret(STRIPE_WEBHOOK_SECRET);

const STRIPE_PRICE_ID_MONTHLY = validateEnvVar('STRIPE_PRICE_ID_MONTHLY', process.env.STRIPE_PRICE_ID_MONTHLY);
const STRIPE_PRICE_ID_ANNUAL = validateEnvVar('STRIPE_PRICE_ID_ANNUAL', process.env.STRIPE_PRICE_ID_ANNUAL);

// Initialize Stripe client with a pinned stable API version and timeout/retry configs
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: EXPECTED_API_VERSION as Stripe.LatestApiVersion,
  timeout: 30000, // 30 seconds timeout
  maxNetworkRetries: 3, // Retry failed requests up to 3 times
  typescript: true,
});

// Verify API version consistency
// Note: Stripe client doesn't expose API version through a public method in recent versions
// The API version is set during initialization and used for all requests
console.log(`Stripe initialized with API version: ${EXPECTED_API_VERSION}`);

// Price IDs from environment (validated)
export const STRIPE_PRICES = {
  MONTHLY: STRIPE_PRICE_ID_MONTHLY,
  ANNUAL: STRIPE_PRICE_ID_ANNUAL,
} as const;

// Export webhook secret for use in webhook handler
export const STRIPE_WEBHOOK_SECRET_EXPORT = STRIPE_WEBHOOK_SECRET;

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


