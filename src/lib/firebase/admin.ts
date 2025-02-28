// This file provides a server-side Firebase client for API routes
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for server-side operations
function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    // If already initialized, use existing app
    const app = apps[0];
    return {
      app,
      db: getFirestore(app),
      auth: getAuth(app),
      storage: getStorage(app)
    };
  }

  // Initialize new app
  console.log('Initializing server-side Firebase client');
  const app = initializeApp(firebaseConfig, 'server');
  return {
    app,
    db: getFirestore(app),
    auth: getAuth(app),
    storage: getStorage(app)
  };
}

// Initialize and export Firebase services
const { app: serverApp, db: serverDb, auth: serverAuth, storage: serverStorage } = initializeFirebase();

export { serverApp, serverDb, serverAuth, serverStorage }; 