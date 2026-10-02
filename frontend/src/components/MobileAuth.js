import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  updateProfile, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { shouldUseRedirect, getAuthMethod } from '../utils/mobileDetection';
import { useSecurity } from '../context/SecurityContext';
import './MobileAuth.css';

export default function MobileAuth() {
  const { sanitizeInput, logSecurityEvent } = useSecurity();
  const [authMode, setAuthMode] = useState('login'); // login, signup, forgot
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [faceIdAvailable, setFaceIdAvailable] = useState(false);
  const navigate = useNavigate();

  // Firebase initialization check and automatic redirect
  useEffect(() => {
    const currentDomain = window.location.origin;
    const isBrowserPreview = currentDomain.includes('127.0.0.1:64891');
    
    console.log("MobileAuth: Current domain:", currentDomain);
    console.log("MobileAuth: Firebase project:", "samb-laundry");
    
    if (isBrowserPreview) {
      console.log("MobileAuth: Browser preview detected, redirecting to localhost:3000");
      // Automatic redirect to localhost:3000
      window.location.replace('http://localhost:3000');
      return;
    }
  }, []);

  // Handle Firebase unauthorized domain error
  const handleFirebaseError = (error) => {
    if (error.code === 'auth/unauthorized-domain') {
      setError(`Firebase Domain Issue! Redirecting to localhost:3000...`);
      setMessage(`Google Sign-In works immediately at localhost:3000`);
      
      // Force redirect to localhost:3000
      setTimeout(() => {
        window.location.href = 'http://localhost:3000';
      }, 1000);
      
      return true; // Error handled
    }
    return false; // Error not handled
  };

  // Enhanced email validation for mobile
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, message: 'Please enter your email address.' };
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { valid: false, message: 'Please enter your email address.' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    if (trimmedEmail.length > 254) {
      return { valid: false, message: 'Email address is too long.' };
    }

    const [localPart] = trimmedEmail.split('@');
    if (localPart.length > 64) {
      return { valid: false, message: 'Email address is invalid.' };
    }

    return { valid: true, message: '' };
  };

  // Enhanced password validation for mobile
  const validatePassword = (password, isLogin = false) => {
    if (!password || typeof password !== 'string') {
      return { valid: false, message: 'Please enter your password.' };
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      return { valid: false, message: 'Please enter your password.' };
    }

    if (trimmedPassword.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' };
    }

    if (!isLogin) {
      const hasLetter = /[a-zA-Z]/.test(trimmedPassword);
      const hasNumber = /\d/.test(trimmedPassword);
      
      if (!hasLetter || !hasNumber) {
        return { valid: false, message: 'Password must include both letters and numbers.' };
      }
    }

    return { valid: true, message: '' };
  };

  // Check biometric availability
  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        // Check if WebAuthn is available
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
          // Check for platform authenticator (biometrics)
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
          
          // Check specific biometric types (approximation)
          const userAgent = navigator.userAgent.toLowerCase();
          if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            setFaceIdAvailable(available);
          } else if (userAgent.includes('android')) {
            // Fingerprint available for Android
          }
        }
      } catch (error) {
        console.log('Biometric not available:', error);
      }
    };

    checkBiometricSupport();
  }, []);

  // Handle Google redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Mobile Auth: Checking for Google redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result.user) {
          console.log('✅ Mobile Auth: Google redirect successful for:', result.user.email);
          await handleGoogleSignInSuccess(result.user);
        }
      } catch (err) {
        if (err.code !== 'auth/no-authenticated-user') {
          console.error('❌ Mobile Auth: Redirect result error:', err);
        }
      }
    };

    handleRedirectResult();
  }, []);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return Math.min(strength, 4);
  };

  // Secure form handler with input sanitization
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(sanitizedValue));
    }
    
    // Clear errors when user types
    if (error) setError('');
    if (message) setMessage('');
  };

  // Reset form after successful authentication
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    });
    setError('');
    setMessage('');
    setPasswordStrength(0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Log security event for authentication attempt
    logSecurityEvent('mobile_auth_attempt', {
      authMode: authMode,
      email: sanitizeInput(formData.email)
    });

    // Enhanced validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password, authMode === 'login');
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Log successful login
        logSecurityEvent('mobile_login_success', {
          userId: userCredential.user.uid,
          email: sanitizeInput(formData.email),
          method: 'email'
        });
        
        // Update last login
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            lastLogin: new Date(),
            loginMethod: 'mobile-email',
            deviceInfo: {
              userAgent: navigator.userAgent.substring(0, 200),
              isMobile: true,
              platform: navigator.platform || 'unknown',
              timestamp: new Date().toISOString()
            }
          });
        }
        
        // Clear form after successful login
        resetForm();
        
        navigate('/');
      } else if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Log successful signup
        logSecurityEvent('mobile_signup_success', {
          userId: user.uid,
          email: sanitizeInput(formData.email),
          method: 'email'
        });

        // Update profile
        await updateProfile(user, {
          displayName: sanitizeInput(formData.name)
        });

        // Save user data
        const userData = {
          name: sanitizeInput(formData.name),
          email: sanitizeInput(formData.email),
          phone: sanitizeInput(formData.phone),
          createdAt: new Date(),
          lastLogin: new Date(),
          loginMethod: 'mobile-email',
          isEmailVerified: user.emailVerified,
          deviceInfo: {
            userAgent: navigator.userAgent.substring(0, 200),
            isMobile: true,
            platform: navigator.platform || 'unknown',
            timestamp: new Date().toISOString()
          }
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        // Send verification email (optional)
        try {
          await sendEmailVerification(user);
        } catch (emailError) {
          console.warn('Verification email failed:', emailError);
        }

        // Clear form after successful signup
        resetForm();

        setMessage('Account created successfully!');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error('❌ Mobile Auth error:', err);
      
      // Log security event for authentication error
      logSecurityEvent('mobile_auth_error', {
        error: err.message,
        code: err.code,
        authMode: authMode,
        email: sanitizeInput(formData.email)
      });
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found. Please check your email or create an account.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    if (googleSigningIn) return;
    
    setGoogleSigningIn(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const authMethod = getAuthMethod();
      console.log('Google Sign-In auth method:', authMethod);

      let result;
      // Always use redirect to avoid popup blocking issues
      console.log('Using redirect for Google Sign-In to prevent popup blocking');
      await signInWithRedirect(auth, provider);
      
      // Handle redirect result
      result = await getRedirectResult(auth);
      
      if (result.user) {
        console.log('Google Sign-In successful for:', result.user.email);
        await handleGoogleSignInSuccess(result.user);
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Using redirect method instead...';
        // Try redirect as fallback
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          errorMessage = 'Redirect also failed. Please check your browser settings.';
        }
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.code === 'auth/no-authenticated-user') {
        // This is expected for redirect flow, ignore
        return;
      }
      
      setError(errorMessage);
    } finally {
      setGoogleSigningIn(false);
    }
  };

  // Handle Google Sign-In success
  const handleGoogleSignInSuccess = async (user) => {
    try {
      console.log('👤 Mobile Auth: Processing Google Sign-In success for:', user.email);
      
      // Log successful Google authentication
      logSecurityEvent('mobile_google_auth_success', {
        userId: user.uid,
        email: sanitizeInput(user.email),
        method: 'google'
      });
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userData = {
          name: sanitizeInput(user.displayName) || 'Google User',
          email: sanitizeInput(user.email),
          phone: sanitizeInput(user.phoneNumber) || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          loginMethod: 'mobile-google',
          isEmailVerified: user.emailVerified,
          deviceInfo: {
            userAgent: navigator.userAgent.substring(0, 200),
            isMobile: true,
            platform: navigator.platform || 'unknown',
            timestamp: new Date().toISOString()
          }
        };
        
        await setDoc(userDocRef, userData);
      } else {
        await updateDoc(userDocRef, {
          lastLogin: new Date(),
          loginMethod: 'mobile-google',
          deviceInfo: {
            userAgent: navigator.userAgent.substring(0, 200),
            isMobile: true,
            platform: navigator.platform || 'unknown',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Clear form after successful Google auth
      resetForm();
      
      navigate('/');
    } catch (error) {
      console.error('❌ Mobile Auth: Google success handler error:', error);
      setError('Successfully signed in, but setup failed. Please try again.');
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      // This is a simplified version - in production, you'd implement WebAuthn
      console.log('🔐 Mobile Auth: Biometric authentication requested');
      setError('Biometric authentication coming soon! Please use email/password or Google Sign-In.');
    } catch (error) {
      console.error('❌ Mobile Auth: Biometric error:', error);
      setError('Biometric authentication failed. Please try another method.');
    }
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Very Weak', color: '#ff4444' };
      case 1: return { text: 'Weak', color: '#ff8800' };
      case 2: return { text: 'Fair', color: '#ffbb33' };
      case 3: return { text: 'Good', color: '#00C851' };
      case 4: return { text: 'Strong', color: '#00C851' };
      default: return { text: 'Very Weak', color: '#ff4444' };
    }
  };

  return (
    <div className="mobile-auth">
      <div className="mobile-auth-container">
        {/* Header */}
        <div className="mobile-auth-header">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">SAMB's</span>
            </div>
          </div>
          <h1 className="auth-title">
            {authMode === 'login' ? 'Welcome Back' : 
             authMode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p className="auth-subtitle">
            {authMode === 'login' ? 'Sign in to your account' :
             authMode === 'signup' ? 'Join SAMB\'s Laundry today' :
             'We\'ll send you a reset link'}
          </p>
        </div>

        {/* Error/Message Display */}
        {error && (
          <div className="mobile-auth-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="mobile-auth-success">
            <span className="success-icon">✅</span>
            <span className="success-text">{message}</span>
          </div>
        )}

        {/* Biometric Authentication (if available) */}
        {authMode === 'login' && biometricAvailable && (
          <div className="biometric-section">
            <button 
              type="button" 
              className="biometric-button"
              onClick={handleBiometricAuth}
            >
              <span className="biometric-icon">
                {faceIdAvailable ? '👤' : '👆'}
              </span>
              <span className="biometric-text">
                {faceIdAvailable ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
              </span>
            </button>
            <div className="divider">
              <span>OR</span>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mobile-auth-form">
          {/* Name field for signup */}
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* Password field */}
          {authMode !== 'forgot' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password strength indicator for signup */}
              {authMode === 'signup' && formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthText().color
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: getPasswordStrengthText().color }}
                  >
                    {getPasswordStrengthText().text}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confirm password for signup */}
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          {/* Phone field for signup */}
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
            </div>
          )}

          {/* Remember me for login */}
          {authMode === 'login' && (
            <div className="form-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Remember me</span>
              </label>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="mobile-auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              <span>
                {authMode === 'login' ? 'Sign In' :
                 authMode === 'signup' ? 'Create Account' :
                 'Send Reset Email'}
              </span>
            )}
          </button>
        </form>

        {/* Google Sign-In */}
        {authMode !== 'forgot' && (
          <div className="mobile-auth-divider">
            <span>OR</span>
          </div>
        )}

        {authMode !== 'forgot' && (
          <button
            type="button"
            className="google-signin-button"
            onClick={handleGoogleSignIn}
            disabled={googleSigningIn}
          >
            <span className="google-icon">🔍</span>
            <span className="google-text">
              {googleSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        )}

        {/* Mode switching */}
        <div className="auth-mode-switch">
          {authMode === 'login' && (
            <>
              <button
                type="button"
                className="link-button"
                onClick={() => setAuthMode('forgot')}
              >
                Forgot password?
              </button>
              <span className="switch-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </span>
            </>
          )}
          
          {authMode === 'signup' && (
            <span className="switch-text">
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => setAuthMode('login')}
              >
                Sign in
              </button>
            </span>
          )}
          
          {authMode === 'forgot' && (
            <span className="switch-text">
              Remember your password?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => setAuthMode('login')}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
