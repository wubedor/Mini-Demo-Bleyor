// src/components/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import other Firebase services you need (e.g., getFirestore, getAuth)
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if a Firebase app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Suppress Firebase popup errors in development
if (process.env.NODE_ENV === 'development') {
  auth.settings.appVerificationDisabledForTesting = true;
}

// Suppress Firebase popup operation errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
       message.includes('PopupOperation'))) {
    // Suppress Firebase popup errors
    return;
  }
  originalConsoleError.apply(console, args);
};

// Export other services, passing the 'app' instance to them
// const db = getFirestore(app);
// const auth = getAuth(app);

export { app }; // Export the initialized app instance
// export { db, auth };
