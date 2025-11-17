import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { stripe } from '../src/lib/stripe';

// Query to fetch latest subscription status from Stripe (read-only)
export const fetchLatestSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // First, get the user from our database to get their Stripe customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) {
      throw new Error("USER_NOT_FOUND: User not found");
    }

    if (!user.stripeCustomerId) {
      throw new Error("RESOURCE_NOT_FOUND: No Stripe customer ID found for this user");
    }

    try {
      // Find all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all', // Include active, past_due, canceled, etc.
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        // No active subscriptions, return defaults
        return {
          subscription: null,
          customerId: user.stripeCustomerId,
          hasActiveSubscription: false,
        };
      }

      const subscription = subscriptions.data[0];
      
      // Entitlement policy: treat active, trialing, and past_due as pro until cancellation
      const proStatuses = ["active", "trialing", "past_due"];
      const isPro = proStatuses.includes(subscription.status);

      return {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
          currentPeriodEnd: (subscription as any).current_period_end,
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        },
        customerId: user.stripeCustomerId,
        hasActiveSubscription: true,
        isPro,
      };
    } catch (error) {
      console.error("Failed to fetch subscription from Stripe:", error);
      throw new Error("Failed to fetch subscription details from Stripe");
    }
  },
});

// Mutation to sync user's subscription status from Stripe to our database
export const syncUserSubscriptionFromStripe = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // First, get the user from our database to get their Stripe customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) {
      throw new Error("USER_NOT_FOUND: User not found");
    }

    if (!user.stripeCustomerId) {
      throw new Error("RESOURCE_NOT_FOUND: No Stripe customer ID found for this user");
    }

    try {
      // Find all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all', // Include active, past_due, canceled, etc.
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        // No active subscription, cancel user's subscription in our system
        await ctx.db.patch(user._id, {
          stripeSubscriptionId: undefined,
          stripeCustomerId: undefined,
          stripePriceId: undefined,
          subscriptionStatus: "canceled",
          subscriptionCurrentPeriodEnd: undefined,
          subscriptionCancelAtPeriodEnd: undefined,
          isPro: false,
        });
        
        return {
          message: 'No subscription found, user reset to free tier',
          subscriptionStatus: 'none',
          isPro: false,
        };
      }

      const subscription = subscriptions.data[0];
      
      // Entitlement policy: treat active, trialing, and past_due as pro until cancellation
      const proStatuses = ["active", "trialing", "past_due"];
      const isPro = proStatuses.includes(subscription.status);

      // Update the user's subscription status in our database
      await ctx.db.patch(user._id, {
        stripeSubscriptionId: subscription.id,
        // Keep the existing stripeCustomerId
        stripePriceId: subscription.items.data[0]?.price.id,
        subscriptionStatus: subscription.status,
        subscriptionCurrentPeriodEnd: (subscription as any).current_period_end,
        subscriptionCancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        isPro,
      });

      return {
        message: 'Subscription synced successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
          currentPeriodEnd: (subscription as any).current_period_end,
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        },
        isPro,
      };
    } catch (error) {
      console.error("Failed to sync subscription from Stripe:", error);
      throw new Error("Failed to sync subscription details from Stripe");
    }
  },
});