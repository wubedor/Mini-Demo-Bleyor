// src/components/firebase.js - DEPRECATED - Use config/firebase.js instead

import { db, auth, app } from '../config/firebase';

// Re-export for backward compatibility
export { db, auth, app };

// Suppress Firebase popup errors in development
if (auth && process.env.NODE_ENV === 'development') {
  try {
    auth.settings.appVerificationDisabledForTesting = true;
  } catch (error) {
    console.warn("Could not disable Firebase app verification:", error);
  }
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
