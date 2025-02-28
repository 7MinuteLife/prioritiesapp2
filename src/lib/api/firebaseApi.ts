/**
 * Firebase API Client
 * Provides a clean interface for interacting with Firebase with offline support
 */

import { db, storage } from '@/lib/firebase/firebase';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Constants
const STORAGE_KEYS = {
  VALUES_BACKUP: 'values_backup',
  OFFLINE_SAVES: 'offline_saves',
  OFFLINE_UPDATES: 'offline_updates'
};

// Types
export interface SaveValuesResponse {
  success: boolean;
  error?: string;
  listId?: string;
  savedOffline?: boolean;
}

export interface PriorityList {
  id: string;
  listName: string;
  createdAt?: string;
  updatedAt?: string;
  values?: any[];
}

/**
 * Save user values to Firestore
 * @param userId User ID
 * @param values Values to save
 * @param listName Name of the list
 * @param listId Optional list ID for updates
 * @returns Response with success status
 */
export async function saveUserValuesApi(
  userId: string, 
  values: any, 
  listName: string, 
  listId?: string
): Promise<SaveValuesResponse> {
  // Input validation
  if (!userId) return { success: false, error: 'User ID is required' };
  if (!values) return { success: false, error: 'Values are required' };
  if (!listName) return { success: false, error: 'List name is required' };

  // Check if we're offline
  if (!navigator.onLine) {
    // Don't call saveToLocalStorage here - let the useOfflineSave hook handle it
    return { 
      success: false, 
      savedOffline: false,
      error: 'You are offline. Please use the offline save functionality.'
    };
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Create or update the document
    if (listId) {
      // Update existing list
      const listRef = doc(db, 'users', userId, 'priorityLists', listId);
      await updateDoc(listRef, {
        values,
        listName,
        updatedAt: timestamp
      });
      return { success: true, listId };
    } else {
      // Create new list
      const listRef = collection(db, 'users', userId, 'priorityLists');
      const newDoc = await addDoc(listRef, {
        values,
        listName,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return { success: true, listId: newDoc.id };
    }
  } catch (error: any) {
    console.error('Error saving values:', error);
    
    // Don't save offline here - let the useOfflineSave hook handle it
    return { 
      success: false, 
      savedOffline: false,
      error: error.message || 'Failed to save values'
    };
  }
}

/**
 * Save values to local storage for offline use
 */
function saveToLocalStorage(userId: string, values: any[], listName: string, listId?: string) {
  try {
    if (listId) {
      // This is an update to an existing list
      const offlineUpdates = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_UPDATES) || '[]');
      offlineUpdates.push({
        listId,
        name: listName,
        values,
        timestamp: new Date().toISOString(),
        userId
      });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_UPDATES, JSON.stringify(offlineUpdates));
    } else {
      // This is a new list
      const offlineSaves = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_SAVES) || '[]');
      offlineSaves.push({
        name: listName,
        values,
        timestamp: new Date().toISOString(),
        userId
      });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SAVES, JSON.stringify(offlineSaves));
    }
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Save offline update for later syncing
 */
export function saveOfflineUpdate(userId: string, values: any[], listName: string, listId?: string) {
  saveToLocalStorage(userId, values, listName, listId);
}

/**
 * Get user values from Firestore
 * @param userId User ID
 * @param listId List ID
 * @returns Values and list name
 */
export async function getUserValuesApi(userId: string, listId: string) {
  if (!userId || !listId) return null;
  
  try {
    // Try to get from API first
    const listRef = doc(db, 'users', userId, 'priorityLists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      const data = listSnap.data();
      return {
        values: data.values,
        listName: data.listName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
    
    // If not found in API, check local storage
    const backup = localStorage.getItem(STORAGE_KEYS.VALUES_BACKUP);
    if (backup) {
      const { columns } = JSON.parse(backup);
      return {
        values: columns,
        listName: 'Local Backup',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting values:', error);
    
    // Try to get from local storage as fallback
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.VALUES_BACKUP);
      if (backup) {
        const { columns } = JSON.parse(backup);
        return {
          values: columns,
          listName: 'Local Backup (Error Recovery)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (localError) {
      console.error('Failed to get from localStorage:', localError);
    }
    
    return null;
  }
}

/**
 * Get user priority lists from Firestore
 * @param userId User ID
 * @returns Array of priority lists
 */
export async function getUserPriorityListsApi(userId: string): Promise<PriorityList[]> {
  if (!userId) return [];
  
  try {
    // Get lists from API
    const listsRef = collection(db, 'users', userId, 'priorityLists');
    const q = query(listsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const lists: PriorityList[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({
        id: doc.id,
        listName: data.listName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        values: data.values
      });
    });
    
    // Get local lists
    const localLists = getLocalLists(userId);
    
    // Combine lists, avoiding duplicates
    const combinedLists = [...lists];
    
    localLists.forEach(localList => {
      // Only add if not already in the API lists
      if (!lists.some(list => list.listName === localList.listName)) {
        combinedLists.push(localList);
      }
    });
    
    return combinedLists;
  } catch (error) {
    console.error('Error getting priority lists:', error);
    
    // Return local lists as fallback
    return getLocalLists(userId);
  }
}

/**
 * Get lists from local storage
 */
function getLocalLists(userId: string): PriorityList[] {
  try {
    const offlineSaves = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_SAVES) || '[]');
    return offlineSaves
      .filter(save => save.userId === userId)
      .map(save => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        listName: `${save.name} (Offline)`,
        createdAt: save.timestamp,
        updatedAt: save.timestamp,
        values: save.values
      }));
  } catch (error) {
    console.error('Failed to get local lists:', error);
    return [];
  }
}

/**
 * Delete a user priority list
 * @param userId User ID
 * @param listId List ID
 * @returns Success status
 */
export async function deleteUserPriorityListApi(userId: string, listId: string): Promise<{ success: boolean, error?: string }> {
  if (!userId || !listId) return { success: false, error: 'User ID and List ID are required' };
  
  // Check if it's a local list
  if (listId.startsWith('local-')) {
    try {
      const offlineSaves = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_SAVES) || '[]');
      const filteredSaves = offlineSaves.filter(save => 
        !(save.userId === userId && `local-${save.timestamp}` === listId)
      );
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SAVES, JSON.stringify(filteredSaves));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete local list:', error);
      return { success: false, error: 'Failed to delete local list' };
    }
  }
  
  // Delete from Firestore
  try {
    const listRef = doc(db, 'users', userId, 'priorityLists', listId);
    await deleteDoc(listRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting list:', error);
    return { success: false, error: error.message || 'Failed to delete list' };
  }
}

/**
 * Get offline updates for syncing
 */
export function getOfflineUpdates(): any[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_UPDATES) || '[]');
  } catch (error) {
    console.error('Failed to get offline updates:', error);
    return [];
  }
}

/**
 * Clear offline updates after syncing
 */
export function clearOfflineUpdates(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_UPDATES, '[]');
  } catch (error) {
    console.error('Failed to clear offline updates:', error);
  }
} 