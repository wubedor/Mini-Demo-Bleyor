import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import './FirebaseAuth.css';

export default function FirebaseAuth() {
  const { 
    user, 
    loading, 
    error, 
    firebaseReady,
    signInWithGoogle, 
    signOut, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    resetPassword,
    clearError 
  } = useFirebase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(email, password);
      } else {
        await signInWithEmailAndPassword(email, password);
      }
    } catch (err) {
      console.error('Email auth error:', err);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google auth error:', err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      alert('Password reset email sent!');
      setResetMode(false);
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  if (loading) {
    return (
      <div className="firebase-auth-container">
        <div className="loading">Loading Firebase...</div>
      </div>
    );
  }

  if (!firebaseReady) {
    return (
      <div className="firebase-auth-container">
        <div className="error-message">
          Firebase is not properly initialized. Please check your configuration.
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="firebase-auth-container">
        <div className="user-info">
          <h2>Welcome, {user.displayName || user.email}!</h2>
          <p>Email: {user.email}</p>
          {user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="profile-pic" />
          )}
          <button onClick={signOut} className="auth-button sign-out">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="firebase-auth-container">
      <div className="auth-card">
        <h2>{resetMode ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In')}</h2>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError} className="close-error">×</button>
          </div>
        )}

        {!resetMode ? (
          <>
            <form onSubmit={handleEmailAuth} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button type="submit" className="auth-button primary">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button onClick={handleGoogleAuth} className="auth-button google">
              Continue with Google
            </button>

            <div className="auth-links">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="link-button"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              <button 
                onClick={() => setResetMode(true)}
                className="link-button"
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button primary">
              Send Reset Email
            </button>
            <button 
              type="button"
              onClick={() => setResetMode(false)}
              className="link-button"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
