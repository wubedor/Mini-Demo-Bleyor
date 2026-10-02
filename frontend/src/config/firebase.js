// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator, doc, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration with universal domain - Updated for samb-s project
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error("Firebase configuration missing fields:", missingFields);
    console.error("Please check your .env file and ensure all Firebase credentials are set.");
    return false;
  }
  
  // Check for placeholder values
  if (firebaseConfig.apiKey.includes("demo") || firebaseConfig.apiKey.includes("abcdef") || 
      firebaseConfig.appId.includes("demo") || firebaseConfig.appId.includes("abcdef")) {
    console.warn("Firebase configuration contains placeholder values. Firebase features will be disabled.");
    return false;
  }
  
  return true;
};

// Initialize Firebase with validation
let app, db, auth, storage;

try {
  // Validate configuration before initialization
  if (!validateFirebaseConfig()) {
    console.warn("Firebase configuration invalid or contains placeholder values. Firebase features will be disabled.");
    // Create null objects for graceful degradation
    app = null;
    db = null;
    auth = null;
    storage = null;
  } else {
    console.log("Initializing Firebase with config:", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? "***" + firebaseConfig.apiKey.slice(-4) : "MISSING"
    });
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully");
    
    // Initialize Firestore
    db = getFirestore(app);
    console.log("Firestore initialized successfully");
    
    // Initialize Auth
    auth = getAuth(app);
    console.log("Firebase Auth initialized successfully");
    
    // Initialize Storage
    storage = getStorage(app);
    console.log("Firebase Storage initialized successfully");
  }
  
  // Verify Auth object is properly initialized (not checking imported functions)
  const authProperties = ['app', 'config', 'currentUser', 'tenantId'];
  const availableProperties = authProperties.filter(prop => auth.hasOwnProperty(prop));
  const missingProperties = authProperties.filter(prop => !auth.hasOwnProperty(prop));
  
  console.log("Auth object properties available:", availableProperties);
  if (missingProperties.length > 0) {
    console.warn("Missing Auth object properties:", missingProperties);
  }
  
  // Test Auth initialization by checking current user
  try {
    const currentUser = auth.currentUser;
    console.log("Auth current user check passed, user:", currentUser ? currentUser.email : "No user");
  } catch (authTestError) {
    console.warn("Auth current user check failed:", authTestError.message);
  }
  
  // Ensure Auth is properly configured
  if (auth && !auth.app) {
    console.warn("Auth app property is missing, attempting to fix...");
    auth.app = app;
  }
  
  if (app) {
    console.log("Firebase initialized successfully for project:", firebaseConfig.projectId);
  } else {
    console.log("Firebase features disabled - using backend-only mode");
  }
  
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
  
  // Create fallback objects for development
  app = null;
  db = null;
  auth = null;
  storage = null;
  
  console.log("Firebase features disabled due to initialization error - using backend-only mode");
}

// Enhanced offline persistence with proper initialization
const initializeFirebaseOffline = async () => {
  try {
    // Try to enable offline persistence
    await enableIndexedDbPersistence(db);
    console.log("Firebase offline persistence enabled successfully");
    return true;
  } catch (err) {
    console.warn("Firebase offline persistence setup:", err.code);
    
    // Handle specific errors
    switch (err.code) {
      case 'failed-precondition':
        console.warn("Multiple tabs open, persistence enabled in first tab only");
        return true;
      case 'unimplemented':
        console.warn("Current browser doesn't support persistence");
        return false;
      default:
        console.warn("Offline persistence not available:", err.message);
        return false;
    }
  }
};

// Enhanced Firebase initialization with comprehensive error handling

// Network status monitoring
export const setupNetworkMonitoring = () => {
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    console.log(`Network status: ${isOnline ? 'Online' : 'Offline'}`);
    
    if (isOnline) {
      console.log("Attempting to reconnect to Firebase...");
    }
  };

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Initial status check
  updateNetworkStatus();
};

// Retry mechanism for offline operations
export const executeWithRetry = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!navigator.onLine) {
        throw new Error("Client is offline");
      }
      
      const result = await operation();
      console.log(`Operation succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error("All retry attempts failed:", error);
        throw error;
      }
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

// Firebase service availability check
export const checkFirebaseServiceAvailability = async () => {
  try {
    // Test basic Firebase connectivity
    const testDoc = doc(db, 'test', 'connectivity');
    await getDoc(testDoc);
    return { available: true, message: 'Firebase service is available' };
  } catch (error) {
    console.warn('Firebase service check failed:', error);
    
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
      return { 
        available: false, 
        message: 'Firebase service temporarily unavailable',
        error: error.code 
      };
    }
    
    return { 
      available: false, 
      message: 'Firebase connectivity issue',
      error: error.code 
    };
  }
};

// Fallback mode for when Firebase is unavailable
export const enableFallbackMode = () => {
  console.log('Enabling fallback mode - Firebase services limited');
  
  // Store data locally when Firebase is unavailable
  const localStorage = {
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Local storage not available:', error);
      }
    },
    getItem: (key) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn('Local storage read error:', error);
        return null;
      }
    }
  };
  
  return localStorage;
};

// Enhanced Firestore operations with offline handling
export const safeFirestoreOperation = async (operation, fallbackData = null) => {
  try {
    // Check network status first
    if (!navigator.onLine) {
      console.log("Device offline - using fallback or cached data");
      if (fallbackData) {
        return fallbackData;
      }
      throw new Error("Device offline and no fallback data available");
    }

    // Try the operation with retry
    return await executeWithRetry(operation, 3, 1000);
  } catch (error) {
    console.warn("Firestore operation failed:", error.message);
    
    // If it's an offline error, try to use cached data
    if (error.message.includes('offline') || error.code === 'unavailable') {
      console.log("Firebase offline - attempting to use cached data");
      
      // Return fallback data if available
      if (fallbackData) {
        return fallbackData;
      }
      
      // Return a safe default
      return null;
    }
    
    // For other errors, rethrow
    throw error;
  }
};

// Safe document getter with offline fallback
export const safeGetDoc = async (docRef, fallbackData = null) => {
  return safeFirestoreOperation(async () => {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }, fallbackData);
};

// Safe collection query with offline fallback
export const safeGetDocs = async (queryRef, fallbackData = []) => {
  return safeFirestoreOperation(async () => {
    const querySnap = await getDocs(queryRef);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, fallbackData);
};

// Enhanced Firebase initialization with comprehensive error handling
export const initializeFirebaseApp = async () => {
  try {
    console.log("Initializing Firebase app...");
    
    // Check if Firebase is already initialized
    if (app) {
      console.log("Firebase app already initialized");
      
      // Ensure offline persistence is enabled
      try {
        await enableIndexedDbPersistence(db);
        console.log("Offline persistence enabled");
      } catch (persistenceError) {
        console.warn("Offline persistence setup failed:", persistenceError.message);
      }
      
      return {
        app,
        db,
        auth,
        initialized: true,
        offlineCapable: true
      };
    }
    
    throw new Error("Firebase app initialization failed");
    
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return {
      app: null,
      db: null,
      auth: null,
      initialized: false,
      error: error.message
    };
  }
};

export { db, auth, storage, app };

// Universal domain configuration
export const UNIVERSAL_DOMAIN = "https://samb-laundry.app";
export const DEVELOPMENT_DOMAIN = "http://localhost:3000";
export const NETWORK_DOMAIN = "http://10.97.183.252:3000";

// Get current domain based on environment
export const getCurrentDomain = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' && port === '3000') {
    return DEVELOPMENT_DOMAIN;
  } else if (hostname === '127.0.0.1' && port === '3000') {
    return DEVELOPMENT_DOMAIN;
  } else if (hostname === '127.0.0.1' && port === '56173') {
    return `http://${hostname}:${port}`;
  } else if (hostname === '10.97.183.252' && port === '3000') {
    return NETWORK_DOMAIN;
  } else if (process.env.NODE_ENV === 'production') {
    return UNIVERSAL_DOMAIN;
  }
  return window.location.origin;
};

// Check if app is running on universal domain
export const isUniversalDomain = () => {
  return window.location.origin === UNIVERSAL_DOMAIN;
};

// Check if app is in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '56173';
};

// Get all authorized domains for Google Sign-In - Updated for current domain
export const getAuthorizedDomains = () => {
  const currentDomain = window.location.origin;
  return [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '127.0.0.1:56173',
    '127.0.0.1:64891',
    '10.97.183.252',
    '10.97.183.252:3000',
    currentDomain,
    'samb-laundry.app',
    'www.samb-laundry.app',
    'samb-s.firebaseapp.com',
    'samb-s.web.app'
  ];
};

// Network connectivity check
export const checkNetworkConnection = () => {
  return navigator.onLine;
};

// Handle network status changes
export const setupNetworkListeners = () => {
  window.addEventListener('online', () => {
    console.log("Network connection restored");
  });
  
  window.addEventListener('offline', () => {
    console.log("Network connection lost - using offline cache");
  });
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!checkNetworkConnection()) {
        throw new Error("Client is offline");
      }
      return await requestFn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export default firebaseConfig;
