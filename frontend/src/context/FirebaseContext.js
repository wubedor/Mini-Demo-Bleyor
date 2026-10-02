import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
let app, auth, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase context initialization failed:", error);
  app = null;
  auth = null;
  googleProvider = null;
}

const FirebaseContext = createContext();

export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.log("Firebase not available - using backend-only mode");
      setFirebaseReady(false);
      setLoading(false);
      return;
    }

    setFirebaseReady(true);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        setUser(null);
      }
    );

    return unsubscribe;
  }, []);

  // Firebase authentication functions
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase authentication is not available");
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithEmailAndPassword = async (email, password) => {
    if (!auth) {
      throw new Error("Firebase authentication is not available");
    }
    try {
      const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const createUserWithEmailAndPassword = async (email, password) => {
    if (!auth) {
      throw new Error("Firebase authentication is not available");
    }
    try {
      const result = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    if (!auth) {
      throw new Error("Firebase authentication is not available");
    }
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    // Firebase services
    auth: auth || null,
    googleProvider: googleProvider || null,
    
    // Auth state
    user,
    loading,
    error,
    firebaseReady,
    
    // Auth functions
    signInWithGoogle,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    resetPassword,
    
    // Clear error
    clearError: () => setError(null)
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export default FirebaseContext;
