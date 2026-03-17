import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, sendEmailVerification, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const navigate = useNavigate();

  // Detect if user is on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  };

  // Handle Google redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for Google redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result.user) {
          console.log('✅ Google redirect successful for:', result.user.email);
          const user = result.user;
          
          // Check if user exists in Firestore, create if not
          const userDocRef = doc(db, 'users', user.uid);
          const { getDoc } = await import('firebase/firestore');
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log('👤 Creating new user in Firestore...');
            await setDoc(userDocRef, {
              name: user.displayName || 'Google User',
              email: user.email,
              phonenumber: user.phoneNumber || '',
              address: '',
              createdAt: new Date()
            });
          }
          
          console.log('🚀 Redirecting to home page...');
          navigate('/');
        } else {
          console.log('ℹ️ No redirect result found (normal state)');
        }
      } catch (error) {
        // Handle specific redirect errors
        if (error.code === 'auth/no-auth-pending') {
          console.log('ℹ️ No pending authentication (normal state)');
        } else if (error.code === 'auth/cancelled-popup-request') {
          console.log('ℹ️ Authentication was cancelled by user');
        } else if (error.code === 'auth/popup-closed-by-user') {
          console.log('ℹ️ Popup was closed by user');
        } else {
          console.warn('⚠️ Redirect result error:', error.message);
        }
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password: password });
    
    if (!isLogin) {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic validation before Firebase call
    if (!formData.email || !formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password || !formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      if (isLogin) {
        // LOGIN FLOW - Use signInWithEmailAndPassword
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        console.log('Attempting to login user:', formData.email);
        console.log('Email format valid:', emailRegex.test(formData.email));
        console.log('Password length:', formData.password.length);
        
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('Login successful for:', userCredential.user.email);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setError('Please verify your email before logging in. Check your inbox for the verification email.');
          return;
        }
        navigate('/');
      } else {
        // SIGNUP FLOW - Use createUserWithEmailAndPassword
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        console.log('Attempting to create user:', formData.email);
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        console.log('User created successfully:', user.email);

        await updateProfile(user, {
          displayName: formData.name
        });

        // Save additional user info to Firestore for the BookingForm to use
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          phonenumber: formData.phone,
          address: formData.address,
          createdAt: new Date()
        });

        await sendEmailVerification(user);
        await signOut(auth);
        setMessage('Account created! Verification email sent. Please verify your email and then login.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Authentication error:', err.code, err.message);
      
      // Enhanced error handling for better user experience
      let errorMessage = err.message;
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          if (isLogin) {
            // This shouldn't happen during login, but if it does, guide user to correct flow
            errorMessage = 'This email already exists. Please use the login form instead.';
            setIsLogin(true); // Switch to login mode
          } else {
            errorMessage = 'This email is already registered. Please login instead or use a different email.';
            setIsLogin(true); // Switch to login mode
          }
          break;
          
        case 'auth/invalid-credential':
          if (isLogin) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            // Suggest password reset after multiple failed attempts
            if (formData.email && emailRegex.test(formData.email)) {
              errorMessage += ' Consider using "Forgot Password?" if you can\'t remember your password.';
            }
          } else {
            errorMessage = 'Invalid credentials provided. Please check your information and try again.';
          }
          break;
          
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please check your email or sign up.';
          break;
          
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again or reset your password.';
          break;
          
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please enter a valid email.';
          break;
          
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
          break;
          
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
          break;
          
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
          
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
          
        case 'auth/invalid-login-credentials':
          errorMessage = 'Invalid login credentials. Please check your email and password.';
          break;
          
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method. Please try signing in with Google or reset your password.';
          break;
          
        default:
          errorMessage = err.message || 'An error occurred. Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleSigningIn) return; // Prevent multiple clicks
    
    setGoogleSigningIn(true);
    setError('');
    
    const provider = new GoogleAuthProvider();
    
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Enhanced mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      (window.innerWidth <= 768 && 'ontouchstart' in window);
      
      if (isMobile) {
        // Use redirect for mobile devices
        console.log('📱 Using redirect for mobile Google Sign-In');
        await signInWithRedirect(auth, provider);
      } else {
        // Use popup for desktop
        console.log('🖥️ Using popup for desktop Google Sign-In');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore, create if not
        const userDocRef = doc(db, 'users', user.uid);
        const { getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || 'Google User',
            email: user.email,
            phonenumber: user.phoneNumber || '',
            address: '',
            createdAt: new Date()
          });
        }
        
        navigate('/');
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      
      // Enhanced error handling for mobile
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. On mobile, please allow popups or try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.message.includes('unauthorized-domain')) {
        errorMessage = 'Google Sign-In is not configured for this domain. Please add this domain to Firebase authorized domains.';
      } else if (err.message.includes('network-request-failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message.includes('too-many-redirects')) {
        errorMessage = 'Too many redirects. Please clear your browser cache and try again.';
      }
      
      setError(errorMessage);
      setGoogleSigningIn(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
          <form onSubmit={handlePasswordReset}>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email" />
            <button type="submit" className="auth-button">Send Reset Link</button>
          </form>
          <p onClick={() => { setShowForgotPassword(false); setError(''); setMessage(''); }} className="auth-toggle">
            Back to Login
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required autoComplete="name" />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required autoComplete="tel" />
              <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required autoComplete="street-address" />
            </>
          )}
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email" />
          <div className="password-input-container">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handlePasswordChange} required autoComplete={isLogin ? "current-password" : "new-password"} />
            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {!isLogin && (
            <div className="password-input-container">
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            </div>
          )}
          
          {!isLogin && formData.password && (
            <div className="password-strength-meter">
              <div className={`strength-bar strength-${passwordStrength}`}></div>
              <span className="strength-text">{['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'][passwordStrength]}</span>
            </div>
          )}

          {isLogin && (
            <div className="remember-me-container">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
          )}
          <button type="submit" className="auth-button">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <div className="auth-divider">
          <span>OR</span>
        </div>
        <button 
          type="button" 
          className="google-signin-button" 
          onClick={handleGoogleSignIn}
          disabled={googleSigningIn}
        >
          {googleSigningIn ? (
            <>
              <div className="spinner"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.89 3-4.3 3-2.59 0-4.7-2.14-4.7-4.79s2.11-4.79 4.7-4.79c1.31 0 2.28.57 2.79 1.04l2.3-2.28C16.09 1.66 14.09 1 12 1 7.58 1 4 4.58 4 9s3.58 8 8 8c4.41 0 7.86-3.12 7.51-9z"/>
                <path fill="#34A853" d="M8.98 17c2.11 0 3.9-.7 5.19-1.89l-2.3-2.28c-.61.59-1.49.99-2.89.99-2.21 0-4.09-1.5-4.76-3.5H1.18v2.35C2.42 15.5 5.5 17 8.98 17z"/>
                <path fill="#FBBC05" d="M4.22 10.32c-.17-.51-.27-1.05-.27-1.62s.1-1.11.27-1.62V4.73H1.18C.43 6.27 0 7.59 0 9.2s.43 2.93 1.18 4.47l2.04-2.35z"/>
                <path fill="#EA4335" d="M8.98 3.79c1.31 0 2.48.45 3.4 1.33l2.06-2.06C13.46 1.66 11.26 1 8.98 1 5.5 1 2.42 2.5 1.18 4.73l2.04 2.35c.67-2 2.55-3.29 4.76-3.29z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        
        {/* Mobile-specific help text */}
        {isMobileDevice() && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center', 
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            📱 Mobile users: You'll be redirected to Google for authentication
          </div>
        )}
        {isLogin && (
          <p onClick={() => { setShowForgotPassword(true); setError(''); setMessage(''); }} className="auth-forgot-password">Forgot Password?</p>
        )}
        <p onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="auth-toggle">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
