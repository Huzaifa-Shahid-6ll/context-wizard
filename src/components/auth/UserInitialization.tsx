'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from '@/lib/icons';
import { Button } from '@/components/ui/button';

const UserInitialization = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const [userInitialized, setUserInitialized] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const convexUser = useQuery(
    api.queries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    const initializeUser = async () => {
      if (!isSignedIn || !user?.id || !user.primaryEmailAddress?.emailAddress) {
        if (!isSignedIn) {
          // If user is not signed in, we're done
          setUserInitialized(true);
        }
        return;
      }

      try {
        // First, check if the user already exists in our system
        if (!convexUser) {
          // User doesn't exist, so create them
          await getOrCreateUser({
            clerkId: user.id,
            email: user.primaryEmailAddress.emailAddress
          });
        }
        
        // Wait a bit more to ensure the user is fully created and queries have updated
        // This helps prevent race conditions where the user creation mutation
        // hasn't propagated to all queries yet
        await new Promise(resolve => setTimeout(resolve, 300));
        setUserInitialized(true);
      } catch (error) {
        console.error('Error initializing user:', error);
        setLoadingError('Failed to initialize user account. Please try again.');
      }
    };

    // Only run initialization when user is signed in and we have user data
    if (isSignedIn && user?.id && user.primaryEmailAddress?.emailAddress) {
      initializeUser();
    } else if (!isSignedIn) {
      // If user is not signed in, we're done
      setUserInitialized(true);
    }
  }, [isSignedIn, user, convexUser, getOrCreateUser]);

  // Show loading state if user is signed in but not yet initialized
  if (isSignedIn && !userInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-card">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground">Setting up your account...</h2>
          <p className="text-foreground/70 mt-2">Just a moment while we prepare your workspace</p>
        </motion.div>
      </div>
    );
  }

  // Show error if initialization failed
  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-card">
        <div className="w-full max-w-md p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Initialization Error</AlertTitle>
            <AlertDescription className="mt-2">
              {loadingError}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If user is not signed in or is initialized, show children
  return <>{children}</>;
};

export default UserInitialization;