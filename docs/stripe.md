# Stripe Integration Documentation

This document provides comprehensive documentation for the Stripe integration in the application.

## Overview

The application uses Stripe for subscription-based payments. The integration includes:
- Checkout flow for new subscriptions
- Webhook handling for subscription events
- Customer portal for subscription management
- Subscription cancellation

## Architecture

### Components

1. **Checkout Endpoint** (`/api/stripe/checkout`)
   - Creates Stripe checkout sessions
   - Validates price IDs
   - Pre-fills customer information

2. **Webhook Handler** (`/api/webhooks/stripe`)
   - Processes Stripe webhook events
   - Updates subscription status in database
   - Handles retries and error recovery

3. **Cancel Endpoint** (`/api/stripe/cancel`)
   - Cancels subscriptions at period end
   - Updates database status

4. **Customer Portal** (`/api/stripe/portal`)
   - Creates Stripe customer portal sessions
   - Allows users to manage billing

5. **Health Check** (`/api/stripe/health`)
   - Monitors Stripe integration health
   - Reports webhook failures and metrics

## Environment Variables

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_...           # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signing secret
STRIPE_PRICE_ID_MONTHLY=price_...  # Monthly subscription price ID
STRIPE_PRICE_ID_ANNUAL=price_...   # Annual subscription price ID
```

All environment variables are validated at startup. Invalid or missing variables will cause the application to fail with descriptive error messages.

## Webhook Events

The application handles the following Stripe webhook events:

### checkout.session.completed
- Triggered when a checkout session is completed
- Updates user subscription status
- Sends analytics event

### customer.subscription.updated
- Triggered when subscription details change
- Updates subscription status, period end, cancellation status

### customer.subscription.deleted
- Triggered when subscription is cancelled
- Removes subscription from user account

### invoice.payment_succeeded
- Triggered when payment succeeds
- Logged for monitoring

### invoice.payment_failed
- Triggered when payment fails
- Marks subscription as past_due

## Security

### Webhook Verification
- All webhooks are verified using Stripe signature
- Invalid signatures are rejected with 400 status
- Events older than 5 minutes are rejected

### Rate Limiting
- Webhook endpoint has rate limiting (100 requests/minute per IP)
- Rate limit exceeded returns 429 status

### Error Handling
- Permanent failures return 400 status (no retry)
- Retryable failures return 500 status (Stripe retries)
- All errors are logged with context

## Webhook Processing

### Retry Logic
- Failed Convex operations are retried up to 3 times
- Exponential backoff: 1s, 2s, 4s delays
- Retry attempts are logged

### Event Logging
- All webhook events are logged to `webhookLogs` table
- Logs include: event ID, type, status, userId, error messages
- Duplicate events are detected and updated

### Error Logging
- Structured error logging with:
  - Event ID and type
  - Error message and stack trace
  - Request context (requestId, userId, etc.)
  - Timestamp

## Database Schema

### Users Table
Subscription-related fields:
- `stripeCustomerId`: Stripe customer ID
- `stripeSubscriptionId`: Stripe subscription ID
- `stripePriceId`: Price ID for the subscription
- `subscriptionStatus`: Current status (active, past_due, etc.)
- `subscriptionCurrentPeriodEnd`: Unix timestamp of period end
- `subscriptionCancelAtPeriodEnd`: Whether subscription will cancel
- `subscriptionTrialEnd`: Trial end timestamp (if applicable)
- `subscriptionBillingCycle`: "monthly" or "annual"
- `subscriptionAmount`: Amount in cents
- `lastWebhookEventId`: Last processed webhook event ID

### Webhook Logs Table
- `eventId`: Stripe event ID (indexed)
- `eventType`: Event type
- `status`: success, failed, or retrying
- `userId`: Clerk user ID (if available)
- `errorMessage`: Error message (if failed)
- `processedAt`: Processing timestamp (indexed)
- `retryCount`: Number of retry attempts
- `requestId`: Internal request ID
- `processingTimeMs`: Processing time in milliseconds

## Troubleshooting

### Webhook Not Received
1. Check webhook endpoint URL in Stripe dashboard
2. Verify webhook secret matches environment variable
3. Check application logs for signature verification errors
4. Ensure endpoint is publicly accessible

### Webhook Processing Failures
1. Check webhook logs in database for error messages
2. Review application logs for detailed error context
3. Verify Convex connection and mutations
4. Check for rate limiting issues

### Subscription Not Updating
1. Verify webhook events are being received
2. Check webhook logs for processing status
3. Verify userId is present in event metadata
4. Check Convex mutations are executing successfully

### Checkout Session Creation Fails
1. Verify Stripe secret key is valid
2. Check price IDs are correct and active
3. Verify user authentication
4. Check application logs for specific errors

## Monitoring

### Health Check Endpoint
GET `/api/stripe/health`

Returns:
- `healthy`: Boolean indicating overall health
- `issues`: Array of issue descriptions
- `metrics`: Webhook failure count and processing time

### Webhook Metrics
- Total events processed
- Success/failure rates
- Average processing time
- Recent failures (last hour)

### Alerts
Webhook failures trigger console alerts with:
- Event ID and type
- Error message
- Retry count
- Timestamp

In production, integrate with monitoring services (Sentry, Datadog, etc.)

## Best Practices

1. **Always verify webhook signatures** - Never process unverified webhooks
2. **Handle idempotency** - Use event IDs to prevent duplicate processing
3. **Log everything** - Comprehensive logging aids debugging
4. **Retry failures** - Implement retry logic for transient failures
5. **Monitor health** - Regularly check health endpoint and metrics
6. **Test webhooks** - Use Stripe CLI to test webhook handling locally

## Testing

### Local Testing
Use Stripe CLI to forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test Events
Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## API Reference

### POST /api/stripe/checkout
Creates a checkout session.

**Request:**
```json
{
  "billingPeriod": "monthly" | "annual",
  "priceId": "price_..." // optional
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

### POST /api/stripe/cancel
Cancels subscription at period end.

**Response:**
```json
{
  "success": true,
  "cancelAtPeriodEnd": true
}
```

### POST /api/stripe/portal
Creates customer portal session.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### POST /api/webhooks/stripe
Stripe webhook endpoint (called by Stripe).

### GET /api/stripe/health
Health check endpoint.

**Response:**
```json
{
  "healthy": true,
  "issues": [],
  "metrics": {
    "recentWebhookFailures": 0,
    "averageProcessingTime": 150
  }
}
```

## Support

For issues or questions:
1. Check application logs
2. Review webhook logs in database
3. Check Stripe dashboard for webhook delivery status
4. Contact support with event IDs and request IDs

