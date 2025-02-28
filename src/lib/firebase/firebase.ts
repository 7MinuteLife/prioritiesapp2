import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Simplified Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Log config for debugging (without sensitive values)
console.log('Firebase config check:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
  appId: firebaseConfig.appId ? 'Set' : 'Missing'
});

// Initialize Firebase services
const initializeFirebaseServices = () => {
  try {
    // Initialize Firebase app if not already initialized
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize services
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    return { app, auth, db, storage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Setup persistence and offline capabilities
const setupPersistence = async (auth, db) => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  try {
    // Enable persistent auth state
    await setPersistence(auth, browserLocalPersistence);
    
    // Enable offline persistence for Firestore with a larger cache size
    await enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });
  } catch (err) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence unavailable - multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.warn('Firestore persistence unavailable - unsupported browser');
    } else {
      console.error('Persistence setup error:', err);
    }
  }
};

// Initialize services
let { app, auth, db, storage } = initializeFirebaseServices();

// Setup persistence in browser environment
if (typeof window !== 'undefined') {
  setupPersistence(auth, db)
    .catch(error => {
      console.error('Failed to setup persistence:', error);
    });
}

export { app, auth, db, storage };
