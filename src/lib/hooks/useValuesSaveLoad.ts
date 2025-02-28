'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { saveUserValuesApi, getUserValuesApi, getUserPriorityListsApi } from '@/lib/api/firebaseApi';
import { useOfflineSave } from './useOfflineSave';

interface UseValuesSaveLoadOptions {
  userId: string | null;
  onSaveSuccess?: () => void;
}

/**
 * Custom hook for handling values save/load functionality
 */
export function useValuesSaveLoad(options: UseValuesSaveLoadOptions) {
  const { userId, onSaveSuccess } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [currentListName, setCurrentListName] = useState('');
  const [savedLists, setSavedLists] = useState<Array<{id: string, listName: string}>>([]);
  const router = useRouter();
  
  const { saveOffline, isOffline } = useOfflineSave({
    userId: userId || '',
    onSuccess: onSaveSuccess
  });

  /**
   * Save values as a new list
   */
  const saveValuesAs = useCallback(async (
    values: any,
    listName: string
  ) => {
    if (!userId) {
      toast.error('Please sign in to save your values');
      return { success: false };
    }

    if (!listName.trim()) {
      toast.error('Please enter a name for your priority list');
      return { success: false };
    }

    setIsSaving(true);
    try {
      // Structure the data in the format expected by the API
      const valuesToSave = {
        column4: {
          values: values.column4.values.map((v: any) => ({
            content: v.content,
            id: v.id,
            isHighlighted: v.isHighlighted
          }))
        }
      };
      
      if (isOffline) {
        return await saveOffline(valuesToSave, listName);
      }
      
      // Use our API endpoint
      const result = await saveUserValuesApi(userId, valuesToSave, listName);
      
      if (result.success) {
        if (!result.savedOffline) {
          toast.success('Values saved successfully!');
        }
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        
        // Only redirect if we're not in offline mode
        if (!result.savedOffline) {
          router.push('/my-lists');
        }
      } else if (result.savedOffline) {
        // If it was saved offline, the saveOffline function will handle the toast
        return result;
      } else {
        // If online save failed and wasn't saved offline, try to save offline
        return await saveOffline(valuesToSave, listName);
      }
      
      return result;
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Save failed: ${error.message || 'Unknown error'}`);
      
      // Try to save offline as a last resort
      try {
        return await saveOffline(valuesToSave, listName);
      } catch (offlineError) {
        return { success: false, error: error.message };
      }
    } finally {
      setIsSaving(false);
    }
  }, [userId, isOffline, saveOffline, router, onSaveSuccess]);

  /**
   * Update an existing list
   */
  const updateExistingList = useCallback(async (
    values: any,
    listId: string
  ) => {
    if (!userId || !currentListName) {
      toast.error('Please sign in and provide a list name');
      return { success: false };
    }

    if (!listId) {
      toast.error('Error: Could not find list to update');
      return { success: false };
    }

    setIsSaving(true);
    try {
      // Structure the data in the format expected by the API
      const valuesToSave = {
        column4: {
          values: values.column4.values.map((v: any) => ({
            content: v.content,
            id: v.id,
            isHighlighted: v.isHighlighted
          }))
        }
      };
      
      if (isOffline) {
        return await saveOffline(valuesToSave, currentListName, listId);
      }
      
      // Use our API endpoint
      const result = await saveUserValuesApi(userId, valuesToSave, currentListName, listId);
      
      if (result.success) {
        if (!result.savedOffline) {
          toast.success('List updated successfully!');
        }
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else if (result.savedOffline) {
        // If it was saved offline, the saveOffline function will handle the toast
        return result;
      } else {
        // If online update failed and wasn't saved offline, try to save offline
        return await saveOffline(valuesToSave, currentListName, listId);
      }
      
      return result;
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(`Update failed: ${error.message || 'Unknown error'}`);
      
      // Try to save offline as a last resort
      try {
        return await saveOffline(valuesToSave, currentListName, listId);
      } catch (offlineError) {
        return { success: false, error: error.message };
      }
    } finally {
      setIsSaving(false);
    }
  }, [userId, currentListName, isOffline, saveOffline, onSaveSuccess]);

  /**
   * Load a list by ID
   */
  const loadList = useCallback(async (
    listId: string,
    currentValues: any,
    setValues: (values: any) => void
  ) => {
    if (!listId || !userId) return false;
    
    try {
      const data = await getUserValuesApi(userId, listId);
      if (data?.values) {
        // Add confirmation if there are unsaved changes
        if (currentValues.column4.values.length > 0) {
          if (window.confirm('Loading a new list will replace your current values. Continue?')) {
            setValues(data.values);
            setCurrentListName(data.listName || 'Untitled List');
            toast.success(`Loaded "${data.listName}" successfully!`);
            return true;
          } else {
            return false;
          }
        } else {
          setValues(data.values);
          setCurrentListName(data.listName || 'Untitled List');
          toast.success(`Loaded "${data.listName}" successfully!`);
          return true;
        }
      } else {
        toast.error('Failed to load list: No data found');
        return false;
      }
    } catch (error) {
      console.error('Error loading list:', error);
      toast.error('Failed to load list');
      return false;
    }
  }, [userId]);

  /**
   * Load saved lists
   */
  const loadSavedLists = useCallback(async () => {
    if (!userId) return;
    
    try {
      const lists = await getUserPriorityListsApi(userId);
      setSavedLists(lists);
    } catch (error) {
      console.error('Error loading saved lists:', error);
    }
  }, [userId]);

  return {
    isSaving,
    currentListName,
    setCurrentListName,
    savedLists,
    saveValuesAs,
    updateExistingList,
    loadList,
    loadSavedLists
  };
} 