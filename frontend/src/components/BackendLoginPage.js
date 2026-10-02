import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendAuth } from '../context/BackendAuthContext';
import './AuthPage.css';

const BackendLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useBackendAuth();
  const [formData, setFormData] = useState({
    email: 'john.doe@example.com',
    password: 'password123'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/account-dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">SAMB Laundry Services</h1>
          <p className="auth-subtitle">Login with Backend Authentication</p>
          <p className="backend-status">Backend JWT Authentication (No Firebase)</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="loading-spinner">Processing...</span>
            ) : (
              'Login'
            )}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account? 
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="toggle-button"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>

        <div className="test-info">
          <h3>Test Credentials:</h3>
          <p><strong>Customer:</strong> john.doe@example.com / password123</p>
          <p><strong>Customer:</strong> anumemma242@gmail.com / admin123</p>
          <p><strong>Admin:</strong> admin@samb-laundry.com / admin123</p>
          <p><strong>Backend Status:</strong> Connected on port 5000</p>
        </div>
      </div>
    </div>
  );
};

export default BackendLoginPage;
