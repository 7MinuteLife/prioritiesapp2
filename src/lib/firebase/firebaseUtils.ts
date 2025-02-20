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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

export const saveUserValues = async (
  userId: string, 
  values: any, 
  listName: string, 
  listId?: string
) => {
  try {
    // Ensure we have a valid values array
    const valuesList = Array.isArray(values) ? values : 
      values?.column4?.values ? values.column4.values :
      values?.values?.column4?.values ? values.values.column4.values : [];

    // Create a standardized data structure
    const data = {
      values: {
        column4: {
          values: valuesList.map((v: { content?: string; id?: string; isHighlighted?: boolean }) => ({
            content: v.content || '',
            id: v.id || Math.random().toString(36).substr(2, 9),
            isHighlighted: Boolean(v.isHighlighted)
          }))
        }
      },
      listName,
      updatedAt: new Date().toISOString(),
      createdAt: listId ? undefined : new Date().toISOString()
    };

    if (listId) {
      await updateDoc(doc(db, 'users', userId, 'priorityLists', listId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } else {
      await addDoc(collection(db, 'users', userId, 'priorityLists'), data);
    }
    return true;
  } catch (error) {
    console.error('Error saving values:', error);
    return false;
  }
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

export async function getUserPriorityLists(userId: string): Promise<PriorityList[]> {
  try {
    const listsRef = collection(db, 'users', userId, 'priorityLists');
    const querySnapshot = await getDocs(listsRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        listName: data.listName || 'Untitled List',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
        values: {
          column4: {
            values: (data.values?.column4?.values || []).map((v: { content?: string; id?: string; isHighlighted?: boolean }) => ({
              content: v.content || '',
              id: v.id || Math.random().toString(36).substr(2, 9),
              isHighlighted: Boolean(v.isHighlighted)
            }))
          }
        }
      };
    });
  } catch (error) {
    console.error('Error getting priority lists:', error);
    return [];
  }
}

export const getUserValues = async (userId: string, listId: string) => {
  try {
    const userValuesRef = doc(db, 'users', userId, 'priorityLists', listId)
    const docSnap = await getDoc(userValuesRef)
    console.log('Retrieved values:', docSnap.data()) // Debug data
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error getting values:', error)
    return null
  }
}

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteUserList = async (userId: string, listId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'priorityLists', listId));
    return true;
  } catch (error) {
    console.error('Error deleting list:', error);
    return false;
  }
};
