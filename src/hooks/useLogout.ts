/**
 * Logout hook with storage cleanup
 * Ensures all sensitive data is cleared on logout
 */

import { useCallback } from 'react';
import { useClerk } from '@clerk/nextjs';
import { clearAllStorage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      // Clear all localStorage data
      clearAllStorage();

      // Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      // Sign out from Clerk
      await signOut();

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if signOut fails, clear storage
      clearAllStorage();
      router.push('/');
    }
  }, [signOut, router]);

  return { logout };
}

