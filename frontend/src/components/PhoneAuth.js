import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useSecurity } from '../context/SecurityContext';
import './PhoneAuth.css';

export default function PhoneAuth() {
  const navigate = useNavigate();
  const { sanitizeInput, logSecurityEvent } = useSecurity();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: phone input, 2: verification, 3: success

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        }
      });
    }
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Sanitize phone number
      const sanitizedPhone = sanitizeInput(phoneNumber);
      
      // Validate phone number format
      if (!sanitizedPhone || sanitizedPhone.length < 10) {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      logSecurityEvent('phone_auth_attempt', {
        phoneNumber: sanitizedPhone,
        step: 'phone_verification'
      });

      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(
        auth,
        sanitizedPhone,
        appVerifier
      );

      setConfirmationResult(confirmation);
      setStep(2);
      setMessage('Verification code sent to your phone');
      
    } catch (error) {
      console.error('Phone auth error:', error);
      setError(error.message);
      logSecurityEvent('phone_auth_error', {
        error: error.message,
        phoneNumber: sanitizeInput(phoneNumber)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!confirmationResult) {
        setError('Please request a verification code first');
        setLoading(false);
        return;
      }

      const sanitizedCode = sanitizeInput(verificationCode);
      
      if (!sanitizedCode || sanitizedCode.length < 6) {
        setError('Please enter a valid verification code');
        setLoading(false);
        return;
      }

      logSecurityEvent('phone_verification_attempt', {
        phoneNumber: phoneNumber,
        step: 'code_verification'
      });

      const result = await confirmationResult.confirm(sanitizedCode);
      
      // Create or update user document
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          phoneNumber: result.user.phoneNumber,
          createdAt: new Date(),
          authMethod: 'phone',
          lastLoginAt: new Date()
        });
      } else {
        await updateDoc(userDocRef, {
          lastLoginAt: new Date(),
          authMethod: 'phone'
        });
      }

      setStep(3);
      setMessage('Phone authentication successful!');
      logSecurityEvent('phone_auth_success', {
        phoneNumber: result.user.phoneNumber,
        userId: result.user.uid
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
      logSecurityEvent('phone_verification_error', {
        error: error.message,
        phoneNumber: phoneNumber
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const sanitizedPhone = sanitizeInput(phoneNumber);
      const appVerifier = window.recaptchaVerifier;
      const phoneProvider = new PhoneAuthProvider(auth);
      
      const confirmation = await signInWithPhoneNumber(
        auth,
        sanitizedPhone,
        appVerifier
      );

      setConfirmationResult(confirmation);
      setMessage('New verification code sent to your phone');
      
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setVerificationCode('');
    setError('');
    setMessage('');
  };

  const formatPhoneNumber = (value) => {
    // Basic phone number formatting
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0,3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
  };

  return (
    <div className="phone-auth">
      <div className="phone-auth-container">
        <div className="phone-auth-header">
          <div className="app-icon">
            <img src="/SAMBS.png" alt="SAMB's Laundry" />
          </div>
          <h2>Phone Authentication</h2>
          <p>Sign in with your phone number</p>
        </div>

        <div className="phone-auth-form">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {step === 1 && (
            <form onSubmit={handlePhoneSubmit}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="phone-input"
                />
                <small>Enter your phone number with country code</small>
              </div>

              <button 
                type="submit" 
                className="phone-submit-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerificationSubmit}>
              <div className="verification-info">
                <p>Verification code sent to:</p>
                <p className="phone-display">{phoneNumber}</p>
              </div>

              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(sanitizeInput(e.target.value))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="code-input"
                />
                <small>Enter the 6-digit code sent to your phone</small>
              </div>

              <div className="verification-actions">
                <button 
                  type="submit" 
                  className="verify-button primary"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className="resend-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend Code'}
                </button>
                
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="back-button"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="success-container">
              <div className="success-icon">✅</div>
              <h3>Authentication Successful!</h3>
              <p>You are now signed in with your phone number.</p>
              <p>Redirecting to your dashboard...</p>
            </div>
          )}
        </div>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
