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
    const data = {
      values,
      listName,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (listId) {
      // Update existing document
      await updateDoc(doc(db, 'users', userId, 'priorityLists', listId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new document
      await addDoc(collection(db, 'users', userId, 'priorityLists'), data);
    }
    return true;
  } catch (error) {
    console.error('Error saving values:', error);
    return false;
  }
};

export const getUserPriorityLists = async (userId: string) => {
  try {
    const listsRef = collection(db, 'users', userId, 'priorityLists');
    const querySnapshot = await getDocs(listsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting priority lists:', error);
    return [];
  }
};

export const getUserValues = async (userId: string, listName: string = 'default') => {
  try {
    const userValuesRef = doc(db, 'users', userId, 'priorityLists', listName);
    const docSnap = await getDoc(userValuesRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting values:', error);
    return null;
  }
};

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
