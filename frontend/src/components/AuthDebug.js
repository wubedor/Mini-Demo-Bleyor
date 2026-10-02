import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import './AuthDebug.css';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const collectDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      domain: window.location.origin,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      firebaseConfig: {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing',
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Missing',
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Missing',
        appId: process.env.REACT_APP_FIREBASE_APP_ID || 'Missing'
      },
      authState: {
        currentUser: auth.currentUser,
        isReady: false
      },
      browserInfo: {
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        language: navigator.language,
        platform: navigator.platform
      }
    };

    // Check Firebase auth state
    auth.authStateReady().then(() => {
      info.authState.isReady = true;
      info.authState.currentUser = auth.currentUser;
    }).catch(err => {
      info.authState.error = err.message;
    });

    setDebugInfo(info);
  };

  const addResult = (test, status, message, details = {}) => {
    setResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const testFirebaseConnection = async () => {
    setLoading(true);
    try {
      await auth.authStateReady();
      addResult('Firebase Connection', 'success', 'Firebase Auth is ready and connected');
    } catch (error) {
      addResult('Firebase Connection', 'error', 'Firebase Auth connection failed', { error: error.message });
    }
    setLoading(false);
  };

  const testEmailSignIn = async () => {
    if (!testEmail || !testPassword) {
      addResult('Email Sign-In', 'error', 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      addResult('Email Sign-In', 'success', 'Sign-in successful', {
        uid: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified
      });
    } catch (error) {
      addResult('Email Sign-In', 'error', 'Sign-in failed', {
        code: error.code,
        message: error.message
      });
    }
    setLoading(false);
  };

  const testGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      addResult('Google Sign-In', 'success', 'Google sign-in successful', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
    } catch (error) {
      addResult('Google Sign-In', 'error', 'Google sign-in failed', {
        code: error.code,
        message: error.message
      });
    }
    setLoading(false);
  };

  const testSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      addResult('Sign Out', 'success', 'Successfully signed out');
      collectDebugInfo();
    } catch (error) {
      addResult('Sign Out', 'error', 'Sign-out failed', { error: error.message });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const copyDebugInfo = () => {
    const info = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(info);
    alert('Debug info copied to clipboard');
  };

  return (
    <div className="auth-debug">
      <div className="debug-header">
        <h2>🔍 Authentication Debug Tool</h2>
        <p>Comprehensive authentication testing and debugging</p>
      </div>

      <div className="debug-section">
        <h3>📊 Environment Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Domain:</label>
            <code>{debugInfo.domain}</code>
          </div>
          <div className="info-item">
            <label>Hostname:</label>
            <code>{debugInfo.hostname}</code>
          </div>
          <div className="info-item">
            <label>Port:</label>
            <code>{debugInfo.port}</code>
          </div>
          <div className="info-item">
            <label>Firebase Project:</label>
            <code>{debugInfo.firebaseConfig.projectId}</code>
          </div>
          <div className="info-item">
            <label>Auth Domain:</label>
            <code>{debugInfo.firebaseConfig.authDomain}</code>
          </div>
          <div className="info-item">
            <label>Current User:</label>
            <code>{debugInfo.authState.currentUser ? 'Logged in' : 'Not logged in'}</code>
          </div>
        </div>
        <button onClick={copyDebugInfo} className="copy-btn">
          📋 Copy Debug Info
        </button>
      </div>

      <div className="debug-section">
        <h3>🧪 Authentication Tests</h3>
        
        <div className="test-controls">
          <button onClick={testFirebaseConnection} disabled={loading}>
            🔗 Test Firebase Connection
          </button>
          
          <button onClick={testSignOut} disabled={loading}>
            🚪 Sign Out
          </button>
          
          <button onClick={clearResults}>
            🗑️ Clear Results
          </button>
        </div>

        <div className="test-forms">
          <div className="test-form">
            <h4>📧 Email Sign-In Test</h4>
            <input
              type="email"
              placeholder="Test email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Test password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
            />
            <button onClick={testEmailSignIn} disabled={loading}>
              🔑 Test Email Sign-In
            </button>
          </div>

          <div className="test-form">
            <h4>🔗 Google Sign-In Test</h4>
            <button onClick={testGoogleSignIn} disabled={loading}>
              🌐 Test Google Sign-In
            </button>
          </div>
        </div>
      </div>

      <div className="debug-section">
        <h3>📋 Test Results</h3>
        <div className="results-container">
          {results.length === 0 ? (
            <p className="no-results">No tests run yet. Run tests above to see results.</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className={`result-item ${result.status}`}>
                <div className="result-header">
                  <span className="test-name">{result.test}</span>
                  <span className={`status ${result.status}`}>
                    {result.status === 'success' ? '✅' : '❌'}
                  </span>
                </div>
                <div className="result-message">{result.message}</div>
                {result.details && Object.keys(result.details).length > 0 && (
                  <div className="result-details">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
                <div className="result-time">{result.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="debug-section">
        <h3>🛠️ Common Issues & Solutions</h3>
        <div className="issues-list">
          <div className="issue-item">
            <h4>auth/unauthorized-domain</h4>
            <p>Add your domain to Firebase authorized domains</p>
            <button onClick={() => window.open('/fix-auth-unauthorized-domain.bat')}>
              🔧 Fix Domain Issues
            </button>
          </div>
          
          <div className="issue-item">
            <h4>auth/network-request-failed</h4>
            <p>Check internet connection and Firebase configuration</p>
          </div>
          
          <div className="issue-item">
            <h4>auth/popup-blocked</h4>
            <p>Allow popups in browser or use redirect method</p>
          </div>
          
          <div className="issue-item">
            <h4>auth/user-not-found</h4>
            <p>User doesn't exist. Sign up first or check email</p>
          </div>
        </div>
      </div>
    </div>
  );
}
