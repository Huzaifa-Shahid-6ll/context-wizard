/**
 * User tier utilities
 * Provides consistent user tier checking across the application
 */

import type { Doc } from '../../convex/_generated/dataModel';

export type UserTier = 'free' | 'pro';
export type UserDoc = Doc<'users'> | null | undefined;

/**
 * Get user tier from user document
 */
export function getUserTier(user: UserDoc): UserTier {
  return user?.isPro === true ? 'pro' : 'free';
}

/**
 * Check if user is pro
 */
export function isProUser(user: UserDoc): boolean {
  return user?.isPro === true;
}

/**
 * Check if user is free tier
 */
export function isFreeUser(user: UserDoc): boolean {
  return !isProUser(user);
}

/**
 * Get user tier with fallback for null/undefined
 */
export function getUserTierSafe(user: UserDoc | null | undefined): UserTier {
  if (!user) {
    return 'free';
  }
  return getUserTier(user);
}

/**
 * Check if user can perform pro action
 */
export function canPerformProAction(user: UserDoc): boolean {
  return isProUser(user);
}

/**
 * Get tier-based limit
 */
export function getTierLimit<T>(user: UserDoc, freeLimit: T, proLimit: T): T {
  return isProUser(user) ? proLimit : freeLimit;
}

