# Rate Limiting Implementation

**Status:** ✅ **Complete**

## Overview

Rate limiting has been fully implemented using Convex database for persistent, distributed rate limiting across all server instances.

## Implementation Details

### 1. Database Schema

Added `rateLimits` table to `convex/schema.ts`:
- `key`: Unique identifier (e.g., "webhook_request:ip:window" or "prompt_gen:userId:2024-01-01")
- `count`: Current request count
- `resetAt`: Unix timestamp when the limit resets
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp
- Indexes: `by_key` (for lookups), `by_resetAt` (for cleanup)

### 2. Rate Limit Functions

Created `convex/lib/rateLimit.ts` with:

#### `checkRateLimit` (Query)
- Checks if a request is allowed without incrementing
- Returns: `{ allowed, remaining, resetAt, count }`

#### `incrementRateLimit` (Mutation)
- Increments the counter and checks if limit is exceeded
- Handles window expiration automatically
- Returns: `{ allowed, count, remaining, resetAt }`

#### `cleanupExpiredRateLimits` (Mutation)
- Removes expired rate limit records
- Should be called periodically (via cron or scheduled function)

#### `getRateLimitStatus` (Query)
- Gets current rate limit status without incrementing
- Useful for displaying limits to users

### 3. Configuration

Rate limits are defined in `RATE_LIMITS` constant:
- `PROMPT_GENERATION_FREE`: 50 per day
- `PROMPT_GENERATION_PRO`: Unlimited
- `CHAT_CREATION_FREE`: 3 per day
- `CHAT_MESSAGES_FREE`: 5 per chat
- `API_REQUESTS`: 100 per minute
- `WEBHOOK_REQUESTS`: 100 per minute per IP

### 4. Integration

#### Webhook Handler
- Replaced in-memory rate limiting with Convex-based
- Uses IP address as identifier
- Logs security events when limit exceeded

#### Exports
- Rate limit functions are re-exported from `convex/mutations.ts` for easier access
- Accessible via `api.mutations.incrementRateLimit`

## Key Features

1. **Persistent**: Rate limits survive server restarts
2. **Distributed**: Works across multiple server instances
3. **Automatic Cleanup**: Expired records can be cleaned up
4. **Flexible**: Supports both time-based and daily windows
5. **Efficient**: Uses indexes for fast lookups

## Usage Examples

### In API Routes
```typescript
const rateLimitCheck = await convex.mutation(api.mutations.incrementRateLimit, {
  identifier: userId, // or IP address
  action: 'prompt_generation',
  limit: 50,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
});

if (!rateLimitCheck.allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

### In Convex Actions
```typescript
const limitCheck = await ctx.runMutation(api.mutations.incrementRateLimit, {
  identifier: userId,
  action: 'chat_creation',
  limit: 3,
  windowMs: 24 * 60 * 60 * 1000,
});
```

## Cleanup

To prevent the rateLimits table from growing indefinitely, set up a scheduled function or cron job to call `cleanupExpiredRateLimits` periodically (e.g., daily).

## Benefits Over In-Memory Rate Limiting

1. ✅ Survives server restarts
2. ✅ Works in distributed environments
3. ✅ Can be monitored and queried
4. ✅ Supports complex rate limiting strategies
5. ✅ Better for production use

---

**Implementation Date:** $(date)  
**Status:** Production Ready

