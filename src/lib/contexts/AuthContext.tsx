"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

// Export the context so it can be imported by useAuth
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  authError: null,
  clearAuthError: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Clear auth errors
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Handle redirect result when the component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully authenticated with Google
          console.log('Successfully signed in with Google redirect');
          setAuthError(null);
          router.push('/');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        setAuthError(error.message || 'Failed to sign in with Google');
      }
    };

    // Only run this once when the component mounts
    handleRedirectResult();
  }, [router]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setAuthError(error.message || 'Failed to sign in');
      }
      throw error;
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      
      // Configure Google provider settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        return result;
      } catch (popupError: any) {
        // If popup is blocked or fails, fall back to redirect
        if (
          popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.code === 'auth/network-request-failed'
        ) {
          await signInWithRedirect(auth, provider);
          // The page will redirect, so we won't reach here until the user comes back
          return null;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setAuthError(error.message || 'Failed to sign in with Google');
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthError(error.message || 'Failed to sign out');
      throw error;
    }
  }, [router]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setAuthError('No account found with this email address.');
      } else {
        setAuthError(error.message || 'Failed to send password reset email');
      }
      throw error;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    authError,
    clearAuthError
  }), [user, loading, signIn, signInWithGoogle, signOut, resetPassword, authError, clearAuthError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
