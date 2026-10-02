import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AccountSetup.css';

export default function AccountSetup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
    accountType: 'customer', // customer, admin, super_admin
    preferredService: 'Regular Laundry',
    preferredTime: 'Morning',
    notifications: true,
    newsletter: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setAccountData({ ...accountData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 50) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      // Register user with backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email: accountData.email,
        password: accountData.password,
        name: accountData.name,
        phone: accountData.phone,
        address: accountData.address,
        city: accountData.city,
        region: accountData.region,
        role: accountData.accountType,
        preferredService: accountData.preferredService,
        preferredTime: accountData.preferredTime,
        notifications: accountData.notifications,
        newsletter: accountData.newsletter
      });

      if (response.data.success) {
        setSuccess('Account created successfully! Redirecting to login...');

        // Store the token if provided
        if (response.data.data?.tokens) {
          localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        }
        if (response.data.data?.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.data.user));
          localStorage.setItem('userRole', response.data.data.user.role);
        }

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.error?.message || response.data.message || 'Failed to create account');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountData({
      ...accountData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="account-setup-container">
      <div className="account-setup-left">
        <div className="branding-section">
          <img src="/SAMBS.png" alt="SAMB's Laundry" className="brand-logo" />
          <h1 className="brand-title">SAMB's Laundry</h1>
          <p className="brand-tagline">Premium Laundry Services</p>
          <div className="trust-badges">
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secure</span>
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>Trusted</span>
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="account-setup-right">
        <div className="form-container">
          <h2 className="form-title">Create Your Account</h2>
          <p className="form-subtitle">Join SAMB's Laundry today</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={accountData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={accountData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="Enter your phone number"
                  value={accountData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="Enter your address"
                  value={accountData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={accountData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Region</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="region"
                    className="form-input"
                    value={accountData.region}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="account-type-selector">
                <label className="account-type-option">
                  <input
                    type="radio"
                    name="accountType"
                    value="customer"
                    checked={accountData.accountType === 'customer'}
                    onChange={handleInputChange}
                  />
                  <span className="account-type-label">Customer</span>
                </label>
                <label className="account-type-option">
                  <input
                    type="radio"
                    name="accountType"
                    value="admin"
                    checked={accountData.accountType === 'admin'}
                    onChange={handleInputChange}
                  />
                  <span className="account-type-label">Admin</span>
                </label>
                <label className="account-type-option">
                  <input
                    type="radio"
                    name="accountType"
                    value="super_admin"
                    checked={accountData.accountType === 'super_admin'}
                    onChange={handleInputChange}
                  />
                  <span className="account-type-label">Super Admin</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={accountData.password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
                <span className="strength-text">
                  {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={accountData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Service</label>
              <div className="input-wrapper">
                <select
                  name="preferredService"
                  className="form-input"
                  value={accountData.preferredService}
                  onChange={handleInputChange}
                >
                  <option value="Regular Laundry">Regular Laundry</option>
                  <option value="Dry Cleaning">Dry Cleaning</option>
                  <option value="Ironing Only">Ironing Only</option>
                  <option value="Express Service">Express Service</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <div className="input-wrapper">
                <select
                  name="preferredTime"
                  className="form-input"
                  value={accountData.preferredTime}
                  onChange={handleInputChange}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={accountData.notifications}
                  onChange={handleInputChange}
                />
                <span>Receive notifications about your orders</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={accountData.newsletter}
                  onChange={handleInputChange}
                />
                <span>Subscribe to newsletter for offers and updates</span>
              </label>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <div className="form-footer">
              <p>Already have an account? <a href="/login">Sign in</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
