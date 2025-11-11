# Pro Status Update Issue - Analysis & Fixes

## Problem Summary
User upgraded to Pro via Stripe, but dashboard still shows "Free" status. The billing page shows:
- "Free" badge instead of "Pro"
- "20 prompts/day" (should be "50 tokens/day" for free users)
- Upgrade buttons still visible

## Root Cause Analysis

### 1. **Webhook May Not Have Fired**
The Stripe webhook (`/api/webhooks/stripe`) is responsible for updating `isPro` status. Possible issues:
- Webhook endpoint not configured in Stripe Dashboard
- Webhook secret mismatch
- Webhook event not received (check Stripe Dashboard → Webhooks → Events)
- `userId` extraction failed in webhook handler

### 2. **User Status Check Commands**

#### Check User Status in Convex:
```bash
# Query user by Clerk ID (replace YOUR_CLERK_ID with actual ID)
npx convex run queries:getUserByClerkId '{"clerkId": "YOUR_CLERK_ID"}'

# Or query user stats
npx convex run users:getUserStats '{"userId": "YOUR_CLERK_ID"}'
```

#### Check Webhook Logs:
```bash
# Query webhook logs to see if events were received
# Note: You may need to add this query first (see Fix 5 below)
npx convex run queries:listWebhookLogs
```

#### Check User Directly in Convex Dashboard:
1. Go to https://dashboard.convex.dev
2. Navigate to your deployment
3. Go to "Data" → "users" table
4. Find your user by `clerkId`
5. Check these fields:
   - `isPro` (should be `true`)
   - `stripeSubscriptionId` (should have a value like `sub_...`)
   - `subscriptionStatus` (should be `"active"`, `"trialing"`, or `"past_due"`)

### 3. **Database Fields to Check**
The user record should have:
- `isPro: true`
- `stripeSubscriptionId: "sub_..."`
- `stripeCustomerId: "cus_..."`
- `subscriptionStatus: "active"` (or "trialing", "past_due")

### 4. **UI Issues Found**

#### Issue 1: Billing Page Shows "20 prompts/day"
**Location:** `src/app/dashboard/billing/page.tsx:261`
- Still shows hardcoded "20 prompts/day" instead of "50 tokens/day"
- Needs update to reflect new token system

#### Issue 2: Billing Page Free Tier Display
**Location:** `src/app/dashboard/billing/page.tsx:259-262`
- Shows outdated limits that don't match the new token system

## Required Fixes

### Fix 1: Update Billing Page UI
**File:** `src/app/dashboard/billing/page.tsx`

**Change line 261:**
```typescript
// OLD:
<li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" aria-hidden /> 20 prompts/day</li>

// NEW:
<li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" aria-hidden /> 50 tokens/day</li>
```

### Fix 2: Add Manual Sync Endpoint
**Create:** `src/app/api/stripe/sync/route.ts`
- Allows manual sync of subscription status from Stripe
- Useful for debugging and fixing missed webhooks

### Fix 3: Improve Webhook Logging
**File:** `src/app/api/webhooks/stripe/route.ts`
- Already has good logging, but ensure webhook events are being received
- Check Stripe Dashboard → Webhooks → Recent events

### Fix 4: Add Debug Info to Billing Page
**File:** `src/app/dashboard/billing/page.tsx`
- Add a debug section showing:
  - Current `isPro` value
  - `subscriptionStatus`
  - `stripeSubscriptionId`
  - Last webhook event processed

## Diagnostic Steps

### Step 1: Check Stripe Dashboard
1. Go to Stripe Dashboard → Customers
2. Find your customer
3. Check if subscription exists and status is "active"
4. Go to Webhooks → Recent events
5. Look for `checkout.session.completed` or `customer.subscription.updated` events
6. Check if webhook was delivered successfully

### Step 2: Check Convex Database
```bash
# Get your Clerk user ID from browser console or Clerk Dashboard
# Then run:
npx convex run queries:getUserByClerkId '{"clerkId": "YOUR_CLERK_ID"}'
```

Expected output should show:
```json
{
  "isPro": true,
  "stripeSubscriptionId": "sub_...",
  "subscriptionStatus": "active",
  ...
}
```

### Step 3: Check Webhook Logs
```bash
# Query recent webhook events
npx convex run queries:listWebhookLogs
```

Look for:
- Recent `checkout.session.completed` events
- Status should be "success"
- Check if `userId` was found

### Step 4: Manual Sync (if webhook failed)
If webhook didn't fire, you can manually trigger sync:
1. Get your Stripe Customer ID from Stripe Dashboard
2. Get your Clerk User ID
3. Create a sync script or use the API endpoint (if Fix 2 is implemented)

## Immediate Actions

1. **Check Stripe Webhook Configuration:**
   - Verify webhook endpoint URL is correct
   - Verify webhook secret matches `STRIPE_WEBHOOK_SECRET` in `.env`
   - Check if webhook events are being sent

2. **Check Convex User Record:**
   - Run the diagnostic query above
   - If `isPro` is `false` but subscription exists in Stripe, webhook failed

3. **Manually Update (Temporary Fix):**
   - If you have access to Convex Dashboard, manually update `isPro: true`
   - Or create a one-off mutation to sync from Stripe

4. **Fix UI Issues:**
   - Update billing page to show "50 tokens/day" instead of "20 prompts/day"

## Files That Need Updates

1. `src/app/dashboard/billing/page.tsx` - Update free tier display text (line 261)
2. `src/app/api/stripe/sync/route.ts` - NEW: Manual sync endpoint (optional but recommended)
3. `convex/queries.ts` - Add query to list webhook logs (if not exists)

### Fix 5: Add Webhook Logs Query
**File:** `convex/queries.ts`

Add this query to check webhook events:
```typescript
export const listWebhookLogs = query({
  args: { 
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("success"), v.literal("failed"), v.literal("retrying"))),
  },
  handler: async (ctx, { limit = 50, status }) => {
    let query = ctx.db.query("webhookLogs");
    if (status) {
      // Note: You may need to add an index for status if not exists
      const all = await query.collect();
      const filtered = all.filter(log => log.status === status);
      return filtered
        .sort((a, b) => b.processedAt - a.processedAt)
        .slice(0, limit);
    }
    const logs = await query
      .order("desc")
      .collect();
    return logs.slice(0, limit);
  },
});
```

## Testing After Fixes

1. Upgrade again in Stripe Sandbox
2. Check webhook logs immediately
3. Verify `isPro` updates in Convex
4. Refresh billing page - should show "Pro" status
5. Check header - should show "Pro" badge instead of "Free"

