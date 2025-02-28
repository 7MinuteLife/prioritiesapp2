'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface UseAuthCheckOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Custom hook for handling authentication checks
 * @param options Configuration options
 * @returns Authentication utilities
 */
export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const { redirectTo = '/login', requireAuth = true } = options;
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Handle profile/auth actions
  const handleAuthAction = useCallback(async () => {
    try {
      if (user) {
        await signOut();
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Auth action error:', error);
    }
  }, [user, signOut, router, redirectTo]);

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    handleAuthAction
  };
} 