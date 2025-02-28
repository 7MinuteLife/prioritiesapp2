'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useOfflineSync from '@/lib/hooks/useOfflineSync';

/**
 * SyncManager component
 * Handles offline/online transitions and sync operations
 * This component doesn't render anything visible but manages sync operations
 */
export default function SyncManager() {
  const { isOffline, hasPendingUpdates, syncOfflineChanges } = useOfflineSync();

  // Handle online/offline transitions
  useEffect(() => {
    const handleOnline = () => {
      toast.success('You are back online!');
      syncOfflineChanges();
    };
    
    const handleOffline = () => {
      toast.error('You are offline. Changes will be saved locally until connection is restored.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineChanges]);

  // Check for pending updates on mount
  useEffect(() => {
    if (hasPendingUpdates && !isOffline) {
      toast.success('You have pending updates to sync. Click the indicator to sync now.');
    }
  }, [hasPendingUpdates, isOffline]);

  // This component doesn't render anything visible
  return null;
} 