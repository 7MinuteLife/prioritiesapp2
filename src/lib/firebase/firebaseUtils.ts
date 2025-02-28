import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  query,
  where,
  limit,
  orderBy,
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Improved retry logic for Firestore operations
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const BACKOFF_FACTOR = 1.5;

/**
 * Enhanced retry logic for Firebase operations
 * @param operation Function to retry
 * @param retries Number of retries remaining
 * @param delay Delay before next retry in ms
 */
async function withRetry<T>(
  operation: () => Promise<T>, 
  retries = MAX_RETRIES, 
  delay = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check if we should stop retrying
    if (retries <= 0 || isNonRetryableError(error)) {
      console.error('Operation failed after maximum retries or non-retryable error:', error);
      throw error;
    }
    
    console.log(`Operation failed, retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Try to reset the network connection if we're having issues and on last retry
    if (retries === 1) {
      try {
        console.log('Attempting to reset Firestore network connection...');
        await disableNetwork(db);
        await enableNetwork(db);
      } catch (netError) {
        console.warn('Network reset failed:', netError);
      }
    }
    
    // Retry with exponential backoff
    return withRetry(operation, retries - 1, Math.min(delay * BACKOFF_FACTOR, 10000));
  }
}

/**
 * Determines if an error should not be retried
 */
function isNonRetryableError(error: any): boolean {
  // Don't retry permission errors, invalid arguments, etc.
  const nonRetryableCodes = [
    'permission-denied',
    'invalid-argument',
    'not-found',
    'already-exists',
    'failed-precondition',
    'out-of-range',
    'unauthenticated'
  ];
  
  return nonRetryableCodes.includes(error.code);
}

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions with improved type safety
export const addDocument = <T>(collectionName: string, data: T) => 
  withRetry(() => addDoc(collection(db, collectionName), data as DocumentData));

export const getDocument = <T>(collectionName: string, id: string): Promise<T | null> => 
  withRetry(async () => {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? (docSnap.data() as T) : null;
  });

export const updateDocument = <T>(collectionName: string, id: string, data: Partial<T>) => 
  withRetry(() => updateDoc(doc(db, collectionName, id), data as DocumentData));

export const setDocument = <T>(collectionName: string, id: string, data: T) => 
  withRetry(() => setDoc(doc(db, collectionName, id), data as DocumentData));

export const deleteDocument = (collectionName: string, id: string) => 
  withRetry(() => deleteDoc(doc(db, collectionName, id)));

export const getCollection = async <T>(
  collectionName: string,
  constraints: {
    whereField?: string;
    whereOperation?: any;
    whereValue?: any;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitTo?: number;
  } = {}
): Promise<T[]> => {
  return withRetry(async () => {
    let q = collection(db, collectionName);
    
    // Apply constraints if provided
    if (constraints.whereField && constraints.whereOperation && constraints.whereValue !== undefined) {
      q = query(q, where(constraints.whereField, constraints.whereOperation, constraints.whereValue));
    }
    
    if (constraints.orderByField) {
      q = query(q, orderBy(constraints.orderByField, constraints.orderDirection || 'asc'));
    }
    
    if (constraints.limitTo) {
      q = query(q, limit(constraints.limitTo));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  });
};

// Enhanced user values saving with better error handling and type safety
export const saveUserValues = async (
  userId: string, 
  values: any, 
  listName: string, 
  listId?: string
): Promise<{ success: boolean; listId?: string; error?: string }> => {
  if (!userId) {
    console.error('saveUserValues: No userId provided');
    return { success: false, error: 'No user ID provided' };
  }

  return withRetry(async () => {
    try {
      // Simplify the values extraction
      let valuesList = [];
      
      if (Array.isArray(values)) {
        valuesList = values;
      } else if (values?.column4?.values) {
        valuesList = values.column4.values;
      } else {
        // If we can't find values in the expected format, log and use empty array
        console.warn('saveUserValues: Unexpected values format', values);
        valuesList = [];
      }

      // Create a simpler data structure
      const data = {
        values: {
          column4: {
            values: valuesList.map((v: any) => ({
              content: v.content || '',
              id: v.id || `value-${Math.random().toString(36).substring(2, 9)}`,
              isHighlighted: Boolean(v.isHighlighted)
            }))
          }
        },
        listName: listName || 'Untitled List',
        updatedAt: serverTimestamp()
      };

      // Add createdAt only for new documents
      if (!listId) {
        data.createdAt = serverTimestamp();
      }

      // Use a batch write for better atomicity
      const batch = writeBatch(db);
      let docRef: DocumentReference;
      
      if (listId) {
        // Update existing document
        docRef = doc(db, 'users', userId, 'priorityLists', listId);
        batch.update(docRef, data);
      } else {
        // Create new document
        docRef = doc(collection(db, 'users', userId, 'priorityLists'));
        listId = docRef.id;
        batch.set(docRef, data);
      }
      
      await batch.commit();
      return { success: true, listId };
    } catch (error) {
      console.error('Error saving values:', error);
      return { success: false, error: error.message || 'Unknown error saving values' };
    }
  });
};

interface ListValue {
  content: string;
  id: string;
  isHighlighted: boolean;
}

interface FirebaseListData {
  values: {
    column4: {
      values: ListValue[];
    };
  };
  listName: string;
  createdAt: string;
  updatedAt: string;
}

interface PriorityList {
  id: string;
  listName: string;
  createdAt: string;
  updatedAt: string;
  values: {
    column4: {
      values: ListValue[];
    };
  };
}

export async function getUserPriorityLists(userId: string): Promise<any[]> {
  if (!userId) {
    console.error('getUserPriorityLists: No userId provided');
    return [];
  }

  return withRetry(async () => {
    try {
      console.log(`Getting priority lists for user: ${userId}`);
      const listsRef = collection(db, 'users', userId, 'priorityLists');
      const querySnapshot = await getDocs(listsRef);
      
      const lists = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          listName: data.listName || 'Untitled List',
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
          values: data.values || { column4: { values: [] } }
        };
      });
      
      console.log(`Retrieved ${lists.length} priority lists`);
      return lists;
    } catch (error) {
      console.error('Error getting priority lists:', error);
      return [];
    }
  });
}

export const getUserValues = async (userId: string, listId: string) => {
  if (!userId || !listId) {
    console.error('getUserValues: Missing userId or listId');
    return null;
  }

  return withRetry(async () => {
    try {
      console.log(`Getting values for user: ${userId}, list: ${listId}`);
      const userValuesRef = doc(db, 'users', userId, 'priorityLists', listId);
      const docSnap = await getDoc(userValuesRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Retrieved values successfully');
        return data;
      }
      
      console.log('No values found for this list ID');
      return null;
    } catch (error) {
      console.error('Error getting values:', error);
      return null;
    }
  });
};

// Storage functions with improved error handling
export const uploadFile = async (file: File, path: string): Promise<string> => {
  return withRetry(async () => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  });
};

export const deleteUserList = async (userId: string, listId: string) => {
  return withRetry(async () => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'priorityLists', listId));
      return true;
    } catch (error) {
      console.error('Error deleting list:', error);
      return false;
    }
  });
};
