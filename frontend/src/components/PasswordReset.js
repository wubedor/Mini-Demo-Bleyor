import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import './PasswordReset.css';

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const [oobCode, setOobCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      verifyResetCode(code);
    } else {
      setError('Invalid password reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const verifyResetCode = async (code) => {
    try {
      setLoading(true);
      setError('');
      
      // Verify the password reset code
      const result = await verifyPasswordResetCode(auth, code);
      setEmail(result);
      setIsCodeValid(true);
      setMessage('Password reset code verified. Please enter your new password.');
    } catch (err) {
      console.error('Password reset code verification error:', err);
      setError('Invalid or expired password reset link. Please request a new password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    try {
      setLoading(true);
      
      // Complete the password reset
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      setIsResetComplete(true);
      setMessage('Password has been successfully reset! You will be redirected to login page...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/expired-action-code') {
        setError('Password reset link has expired. Please request a new password reset.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Invalid password reset link. Please request a new password reset.');
      } else {
        setError('Failed to reset password. Please try again or request a new reset link.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
  const strengthColor = ['#ff4444', '#ff6666', '#ffaa44', '#aaff44', '#44ff44', '#00cc00'][passwordStrength];

  if (loading && !isCodeValid) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <div className="loading-spinner"></div>
          <h2>Verifying reset link...</h2>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <div className="success-icon">✅</div>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been successfully reset.</p>
          <p>You will be redirected to the login page in a few seconds...</p>
          <button 
            onClick={() => navigate('/login')} 
            className="reset-button"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h2>Reset Your Password</h2>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        {isCodeValid && (
          <form onSubmit={handlePasswordReset} className="reset-form">
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="disabled-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
                className="password-input"
              />
              
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength / 6) * 100}%`,
                        backgroundColor: strengthColor 
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: strengthColor }}>
                    {strengthText}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
                className="password-input"
              />
            </div>
            
            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={newPassword.length >= 6 ? 'valid' : 'invalid'}>
                  At least 6 characters long
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'valid' : 'invalid'}>
                  At least one uppercase letter
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'valid' : 'invalid'}>
                  At least one lowercase letter
                </li>
                <li className={/\d/.test(newPassword) ? 'valid' : 'invalid'}>
                  At least one number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'valid' : 'invalid'}>
                  At least one special character (recommended)
                </li>
              </ul>
            </div>
            
            <button 
              type="submit" 
              className="reset-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
        
        <div className="reset-footer">
          <button 
            onClick={() => navigate('/login')} 
            className="back-to-login"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
