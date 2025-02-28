import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getOfflineUpdates, clearOfflineUpdates, saveUserValuesApi } from '@/lib/api/firebaseApi';
import { toast } from 'react-hot-toast';

/**
 * Hook to manage offline state and synchronization
 * Provides functions and state for handling offline/online transitions
 */
export function useOfflineSync() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  const { user } = useAuth();

  // Check for pending updates
  useEffect(() => {
    const checkPendingUpdates = () => {
      try {
        const updates = getOfflineUpdates();
        setHasPendingUpdates(updates.length > 0);
      } catch (error) {
        console.error('Error checking pending updates:', error);
      }
    };

    if (user) {
      checkPendingUpdates();
      
      // Set up interval to check for updates
      const interval = setInterval(checkPendingUpdates, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Only show toast if we were previously offline
      if (isOffline) {
        toast.success('You are back online!');
        
        // Auto-sync if user is logged in
        if (user) {
          syncOfflineChanges();
        }
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('You are offline. Changes will be saved locally until connection is restored.');
    };
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isOffline]);

  // Sync offline changes
  const syncOfflineChanges = useCallback(async () => {
    if (!user || isOffline) return;
    
    setIsSyncing(true);
    try {
      const offlineUpdates = getOfflineUpdates();
      
      if (offlineUpdates.length > 0) {
        const toastId = toast.loading('Syncing offline updates...');
        let successCount = 0;
        let failCount = 0;
        
        for (const update of offlineUpdates) {
          if (update.userId === user.uid) {
            try {
              const result = await saveUserValuesApi(
                user.uid, 
                update.values, 
                update.name, 
                update.listId
              );
              
              if (result.success) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (error) {
              console.error('Failed to sync update:', update.name, error);
              failCount++;
            }
          }
        }
        
        // Clear synced updates
        clearOfflineUpdates();
        setHasPendingUpdates(false);
        
        // Dismiss loading toast
        toast.dismiss(toastId);
        
        // Show summary toast
        if (successCount > 0 && failCount === 0) {
          toast.success(`Successfully synced ${successCount} updates!`);
        } else if (successCount > 0 && failCount > 0) {
          toast.success(`Synced ${successCount} updates, but ${failCount} failed.`);
        } else if (failCount > 0) {
          toast.error(`Failed to sync ${failCount} updates.`);
        }
      }
    } catch (error) {
      console.error('Error syncing offline changes:', error);
      toast.error('Error syncing offline changes');
    } finally {
      setIsSyncing(false);
    }
  }, [user, isOffline]);

  // Force sync (can be called from UI)
  const forceSync = useCallback(() => {
    if (isOffline) {
      toast.error('Cannot sync while offline. Please check your connection.');
      return;
    }
    
    if (!user) {
      toast.error('Please sign in to sync your changes.');
      return;
    }
    
    syncOfflineChanges();
  }, [isOffline, user, syncOfflineChanges]);

  return {
    isOffline,
    isSyncing,
    hasPendingUpdates,
    syncOfflineChanges,
    forceSync
  };
}

export default useOfflineSync; 