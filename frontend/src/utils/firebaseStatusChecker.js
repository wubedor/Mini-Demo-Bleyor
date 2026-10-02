// Firebase Status Checker
// Comprehensive Firebase authentication and configuration status

import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

class FirebaseStatusChecker {
  constructor() {
    this.status = {
      config: false,
      auth: false,
      firestore: false,
      storage: false,
      rules: false,
      overall: false
    };
    this.details = {};
  }

  // Check Firebase configuration
  async checkConfig() {
    try {
      const config = {
        apiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
        appId: !!process.env.REACT_APP_FIREBASE_APP_ID,
        storageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
      };

      const allConfigPresent = Object.values(config).every(value => value);
      
      this.status.config = allConfigPresent;
      this.details.config = {
        ...config,
        allPresent: allConfigPresent,
        missing: Object.keys(config).filter(key => !config[key])
      };

      console.log('🔥 Firebase Config Check:', this.details.config);
      return allConfigPresent;
    } catch (error) {
      console.error('❌ Firebase Config Check Error:', error);
      this.status.config = false;
      this.details.config = { error: error.message };
      return false;
    }
  }

  // Check Firebase Auth
  async checkAuth() {
    try {
      // Test auth initialization
      const authReady = !!auth && typeof auth === 'object';
      
      // Test auth methods
      const authMethods = {
        signIn: typeof signInWithEmailAndPassword === 'function',
        signUp: typeof createUserWithEmailAndPassword === 'function',
        signOut: typeof auth.signOut === 'function',
        onAuthStateChanged: typeof auth.onAuthStateChanged === 'function',
        currentUser: !!auth.currentUser
      };

      const allMethodsAvailable = Object.values(authMethods).every(method => method);
      
      this.status.auth = allMethodsAvailable;
      this.details.auth = {
        ready: authReady,
        methods: authMethods,
        allAvailable: allMethodsAvailable,
        currentUser: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          emailVerified: auth.currentUser.emailVerified
        } : null
      };

      console.log('🔐 Firebase Auth Check:', this.details.auth);
      return allMethodsAvailable;
    } catch (error) {
      console.error('❌ Firebase Auth Check Error:', error);
      this.status.auth = false;
      this.details.auth = { error: error.message };
      return false;
    }
  }

  // Check Firestore connectivity
  async checkFirestore() {
    try {
      // Test basic Firestore connection
      const testDoc = doc(collection(db, 'test'), 'connection-test');
      
      // Try to write test data
      await testDoc.set({
        timestamp: new Date().toISOString(),
        test: 'firebase-status-check',
        type: 'connectivity-test'
      });

      // Try to read test data
      const testRead = await getDoc(testDoc);
      const readSuccess = testRead.exists();

      // Try to list collections
      const collectionsTest = await getDocs(collection(db, 'services'));
      const listSuccess = !collectionsTest.empty;

      const firestoreReady = readSuccess && listSuccess;
      
      this.status.firestore = firestoreReady;
      this.details.firestore = {
        connected: firestoreReady,
        writeTest: readSuccess,
        readTest: readSuccess,
        listTest: listSuccess,
        collectionsAccessible: collectionsTest.size
      };

      console.log('🗄️ Firebase Firestore Check:', this.details.firestore);
      return firestoreReady;
    } catch (error) {
      console.error('❌ Firebase Firestore Check Error:', error);
      this.status.firestore = false;
      this.details.firestore = { 
        error: error.message,
        code: error.code,
        type: error.name
      };
      return false;
    }
  }

  // Check Firebase Storage
  async checkStorage() {
    try {
      const storageReady = !!db && typeof db === 'object';
      
      this.status.storage = storageReady;
      this.details.storage = {
        available: storageReady,
        bucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
      };

      console.log('📦 Firebase Storage Check:', this.details.storage);
      return storageReady;
    } catch (error) {
      console.error('❌ Firebase Storage Check Error:', error);
      this.status.storage = false;
      this.details.storage = { error: error.message };
      return false;
    }
  }

  // Check Firestore Rules
  async checkRules() {
    try {
      // Test read access to services collection
      const servicesTest = await getDocs(collection(db, 'services'));
      const servicesAccessible = !servicesTest.empty;

      // Test write access to test collection
      const testDoc = doc(collection(db, 'test'), 'rules-test');
      await testDoc.set({
        timestamp: new Date().toISOString(),
        test: 'rules-check'
      });
      const writeAccessible = true;

      const rulesWorking = servicesAccessible && writeAccessible;
      
      this.status.rules = rulesWorking;
      this.details.rules = {
        servicesRead: servicesAccessible,
        testWrite: writeAccessible,
        overall: rulesWorking
      };

      console.log('📋 Firebase Rules Check:', this.details.rules);
      return rulesWorking;
    } catch (error) {
      console.error('❌ Firebase Rules Check Error:', error);
      this.status.rules = false;
      this.details.rules = { 
        error: error.message,
        code: error.code,
        type: 'permission-denied' === error.code ? 'PERMISSION_DENIED' : 'OTHER'
      };
      return false;
    }
  }

  // Run comprehensive Firebase status check
  async runFullCheck() {
    console.log('🔍 Running comprehensive Firebase status check...');
    
    const results = await Promise.allSettled([
      this.checkConfig(),
      this.checkAuth(),
      this.checkFirestore(),
      this.checkStorage(),
      this.checkRules()
    ]);

    const status = {
      config: results[0].status,
      auth: results[1].status,
      firestore: results[2].status,
      storage: results[3].status,
      rules: results[4].status
    };

    this.status.overall = Object.values(status).every(check => check);
    
    console.log('📊 Firebase Status Summary:', {
      overall: this.status.overall ? '✅ HEALTHY' : '❌ ISSUES',
      ...status
    });

    return {
      overall: this.status.overall,
      status: this.status,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }

  // Get current status
  getCurrentStatus() {
    return {
      overall: this.status.overall,
      status: this.status,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }

  // Get sign-in readiness
  getSignInReadiness() {
    const readiness = {
      configReady: this.status.config,
      authReady: this.status.auth,
      firestoreReady: this.status.firestore,
      rulesReady: this.status.rules,
      overallReady: this.status.overall
    };

    const issues = [];
    
    if (!this.status.config) {
      issues.push('Firebase configuration missing or incomplete');
    }
    
    if (!this.status.auth) {
      issues.push('Firebase authentication not properly initialized');
    }
    
    if (!this.status.firestore) {
      issues.push('Firestore connection failed or permissions denied');
    }
    
    if (!this.status.rules) {
      issues.push('Firestore rules blocking access - need to deploy updated rules');
    }

    return {
      ready: this.status.overall,
      readiness: readiness,
      issues: issues,
      recommendations: this.getRecommendations()
    };
  }

  // Get recommendations based on current status
  getRecommendations() {
    const recommendations = [];
    
    if (!this.status.config) {
      recommendations.push('Check .env file for missing Firebase configuration');
    }
    
    if (!this.status.auth) {
      recommendations.push('Verify Firebase Auth configuration and API keys');
    }
    
    if (!this.status.firestore) {
      recommendations.push('Deploy updated Firestore rules to fix permission issues');
    }
    
    if (!this.status.rules) {
      recommendations.push('Update Firestore security rules to allow proper access');
    }

    return recommendations;
  }
}

// Create and export singleton instance
const firebaseStatusChecker = new FirebaseStatusChecker();
export default firebaseStatusChecker;
