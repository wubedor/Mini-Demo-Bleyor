import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useSecurity } from '../context/SecurityContext';
import { auth, db } from '../config/firebase';
import './MobileLogin.css';

export default function MobileLogin() {
  const navigate = useNavigate();
  const { sanitizeInput, logSecurityEvent } = useSecurity();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({});

  // Check if Firebase is available
  const isFirebaseAvailable = auth && db;

  if (!isFirebaseAvailable) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Unavailable</h2>
        <p>Firebase authentication is not configured. Please use the backend authentication instead.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Go to Backend Login
        </button>
      </div>
    );
  }

  useEffect(() => {
    // Detect device info for mobile optimization
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: ''
    });
    setError('');
    setSuccess('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login
        logSecurityEvent('mobile_login_attempt', {
          email: formData.email,
          device: deviceInfo
        });

        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setSuccess('Redirecting...');
        
        // Clear form after successful login
        resetForm();
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Sign up
        logSecurityEvent('mobile_signup_attempt', {
          email: formData.email,
          device: deviceInfo
        });

        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update profile
        await auth.currentUser.updateProfile({
          displayName: formData.name
        });

        // Send email verification
        await sendEmailVerification(result.user);

        // Create user document
        await setDoc(doc(db, 'users', result.user.uid), {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          createdAt: new Date(),
          deviceInfo: deviceInfo
        });

        setSuccess('Account created! Check your email for verification.');
        
        // Clear form after successful signup
        resetForm();
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      logSecurityEvent('mobile_auth_error', {
        error: error.message,
        device: deviceInfo
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      logSecurityEvent('mobile_google_auth_attempt', {
        device: deviceInfo
      });

      const result = await signInWithPopup(auth, provider);
      
      // Create user document if new
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          name: result.user.displayName,
          phone: result.user.phoneNumber,
          createdAt: new Date(),
          deviceInfo: deviceInfo
        });
      }

      setSuccess('Redirecting...');
      
      // Clear form after successful Google auth
      resetForm();
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setError(error.message);
      logSecurityEvent('mobile_google_auth_error', {
        error: error.message,
        device: deviceInfo
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-login">
      <div className="mobile-login-header">
        <div className="app-icon">
          <img src="/SAMBS.png" alt="SAMB's Laundry" />
        </div>
        <h1>SAMB's Laundry</h1>
        <p>Professional laundry services at your fingertips</p>
      </div>

      <div className="mobile-login-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Google Sign-In */}
        <button 
          onClick={handleGoogleAuth}
          className="google-auth-button"
          disabled={loading}
        >
          <img src="/google-icon.png" alt="Google" className="google-icon" />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                required={!isLogin}
                className="mobile-input"
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
              className="mobile-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="mobile-input"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number (Optional)"
                className="mobile-input"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="mobile-submit-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="switch-button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <div className="mobile-login-footer">
        <div className="features">
          <div className="feature">
            <span className="feature-icon">📅</span>
            <span className="feature-text">Track Orders</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💰</span>
            <span className="feature-text">Best Prices</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏠</span>
            <span className="feature-text">Home Pickup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
