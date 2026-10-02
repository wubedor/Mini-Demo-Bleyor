import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SignInDebug() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleTestSignIn = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      console.log('🔍 Testing sign-in with:', { email, passwordLength: password.length });
      console.log('🔍 Firebase auth object:', auth);
      
      // Test Firebase connection
      await auth.authStateReady();
      console.log('✅ Firebase Auth is ready');
      
      // Attempt sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Sign-in successful:', userCredential.user);
      setResult(`SUCCESS: User ${userCredential.user.email} signed in successfully!`);
      
    } catch (err) {
      console.error('❌ Sign-in error:', err);
      setError(`ERROR: ${err.code} - ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirebase = () => {
    console.log('🔍 Firebase Debug Info:');
    console.log('Auth object:', auth);
    console.log('Current user:', auth.currentUser);
    console.log('Auth config:', auth.config);
    console.log('Environment variables:', {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Missing',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Missing',
      appId: process.env.REACT_APP_FIREBASE_APP_ID || 'Missing'
    });
    
    setResult('Check browser console for detailed Firebase debug information');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>🔍 Sign-In Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Firebase Connection</h3>
        <button onClick={handleTestFirebase} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          Test Firebase Connection
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Sign-In</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <button 
          onClick={handleTestSignIn} 
          disabled={loading}
          style={{ padding: '10px', background: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {loading ? 'Testing...' : 'Test Sign-In'}
        </button>
      </div>

      {result && (
        <div style={{ padding: '10px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', marginBottom: '10px' }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
        <h4>📋 Debugging Steps:</h4>
        <ol>
          <li>Click "Test Firebase Connection" to check Firebase setup</li>
          <li>Check browser console for detailed debug information</li>
          <li>Enter valid email and password</li>
          <li>Click "Test Sign-In" to test authentication</li>
          <li>Check console for detailed error messages</li>
        </ol>
        
        <h4>🔍 Common Issues:</h4>
        <ul>
          <li><strong>auth/user-not-found</strong>: No account with this email exists</li>
          <li><strong>auth/wrong-password</strong>: Incorrect password</li>
          <li><strong>auth/invalid-email</strong>: Invalid email format</li>
          <li><strong>auth/network-request-failed</strong>: Network connection issue</li>
          <li><strong>auth/too-many-requests</strong>: Too many failed attempts</li>
        </ul>
      </div>
    </div>
  );
}
