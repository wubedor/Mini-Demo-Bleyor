import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';
import { socketHelper } from '../utils/socketHelper';

const TestBackendAuth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'anumemma24@gmail.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const response = await axios.post(`${BACKEND_CONFIG.apiURL}/auth/login`, formData);
      
      const { user, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Connect Socket.IO
      socketHelper.disconnect();
      socketHelper.connect(tokens.accessToken);
      
      setResult(`SUCCESS: Logged in as ${user.email}`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Auth error:', error);
      setResult(`ERROR: ${error.response?.data?.error?.message || 'Authentication failed'}`);
    } finally {
      setLoading(false);
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
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Backend Authentication Test</h2>
      <p>Test the backend authentication system directly</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend Login'}
        </button>
      </form>
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.startsWith('SUCCESS') ? '#d4edda' : '#f8d7da',
          color: result.startsWith('SUCCESS') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {result}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Admin Credentials:</h4>
        <p>anumemma24@gmail.com / admin123</p>
        <p>bleyorsampson6@gmail.com / admin123</p>
        <p>mirabelkwei6@gmail.com / admin123</p>
      </div>
    </div>
  );
};

export default TestBackendAuth;
