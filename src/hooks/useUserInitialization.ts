import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook to check if the current user is fully initialized in our system
 * This helps prevent race conditions between Clerk authentication and Convex user creation
 * @returns Object with initialization status and user data
 */
export const useUserInitialization = () => {
  const { user, isSignedIn } = useUser();
  const convexUser = useQuery(
    api.queries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // User is initialized if they're not signed in (public route) OR 
  // if they're signed in AND their Convex record exists
  const isUserInitialized = !isSignedIn || (isSignedIn && !!convexUser);

  return {
    isUserInitialized,
    clerkUser: user,
    convexUser,
    isSignedIn
  };
};