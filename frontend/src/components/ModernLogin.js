import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModernLogin.css';

const ModernLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setMessage(`Server error: ${response.status}`);
        setMessageType('error');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        const user = data.data.user;
        const tokens = data.data.tokens;
        
        setMessage('Login successful!');
        setMessageType('success');
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Redirect based on user role
        setTimeout(() => {
          if (user.role === 'admin' || user.role === 'super_admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
        
      } else {
        setMessage(data.error?.message || 'Login failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Connection error. Please check if the backend is running.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-container">
      {/* Left Side - Branding */}
      <div className="login-left">
        <div className="login-branding">
          <div className="brand-logo">
            <img src="/SAMBS.png" alt="SAMB's Laundry" className="logo-image" />
          </div>
          <h1 className="brand-title">SAMB's Laundry</h1>
          <p className="brand-subtitle">Connecting customers to premium laundry services</p>
          
          <button className="marketplace-btn">
            Premium Laundry Services
          </button>
          
          <div className="brand-message">
            <h2>Grow your business. Connect with the right service.</h2>
            <p>
              SAMB's Laundry helps customers and service providers connect, schedule, 
              and manage laundry services more efficiently with real-time tracking and quality assurance.
            </p>
          </div>
          
          <div className="security-badge">
            <div className="security-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>Secure authentication and protected accounts</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue to your SAMB's Laundry account.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="signin-button"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign in
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            {/* Create Account Link */}
            <div className="create-account">
              <p>Don't have an account? <a href="/register">Create account</a></p>
            </div>

            {/* Security Message */}
            <div className="login-security">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Your account information is securely protected</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
