'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useOfflineSync } from './useOfflineSync';

// Constants
const STORAGE_KEYS = {
  OFFLINE_SAVES: 'offline_saves',
  OFFLINE_UPDATES: 'offline_updates'
};

interface OfflineSaveOptions {
  userId: string;
  onSuccess?: () => void;
}

/**
 * Custom hook for handling offline saves with proper error handling
 */
export function useOfflineSave(options: OfflineSaveOptions) {
  const { userId, onSuccess } = options;
  const [isSaving, setIsSaving] = useState(false);
  const { isOffline } = useOfflineSync();

  /**
   * Save data offline
   */
  const saveOffline = useCallback(async (
    data: any,
    name: string,
    listId?: string
  ) => {
    if (!userId) {
      toast.error('User ID is required for offline save');
      return { success: false, error: 'User ID is required' };
    }

    setIsSaving(true);
    try {
      // Determine if this is a new save or an update
      const storageKey = listId ? STORAGE_KEYS.OFFLINE_UPDATES : STORAGE_KEYS.OFFLINE_SAVES;
      
      // Get existing offline data
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Create new entry
      const newEntry = {
        userId,
        listId,
        name,
        values: data,
        timestamp: new Date().toISOString()
      };
      
      // Add to existing data
      existingData.push(newEntry);
      
      // Save back to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        // Only show toast if we're actually offline
        if (isOffline) {
          toast.success(listId 
            ? 'Update saved offline. Will sync when connection is restored.' 
            : 'Values saved offline. Will sync when connection is restored.');
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        return { success: true, savedOffline: true };
      } catch (storageError) {
        // Handle localStorage quota exceeded or other storage errors
        console.error('localStorage error:', storageError);
        toast.error('Failed to save offline: Storage limit exceeded');
        return { success: false, error: 'Storage limit exceeded' };
      }
    } catch (error: any) {
      console.error('Failed to save offline:', error);
      toast.error('Failed to save offline');
      return { success: false, error: error.message || 'Failed to save offline' };
    } finally {
      setIsSaving(false);
    }
  }, [userId, onSuccess, isOffline]);

  return {
    saveOffline,
    isSaving,
    isOffline
  };
} 