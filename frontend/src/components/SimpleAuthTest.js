import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';

const SimpleAuthTest = () => {
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleTest = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('Testing auth with:', { email, password });
      console.log('API URL:', BACKEND_CONFIG.apiURL + '/auth/login');

      const response = await axios.post(BACKEND_CONFIG.apiURL + '/auth/login', {
        email,
        password
      });

      console.log('Response:', response.data);
      setResult(`SUCCESS: ${response.data.message}`);
      
      // Store tokens
      if (response.data.data.tokens) {
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        setResult(`SUCCESS: Logged in as ${response.data.data.user.email}`);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.response) {
        console.log('Error response:', error.response.data);
        setResult(`ERROR: ${error.response.data.error?.message || error.response.data.message}`);
      } else {
        setResult(`ERROR: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Simple Backend Auth Test</h2>
      <p>Test authentication directly with backend</p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      
      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: result.startsWith('SUCCESS') ? '#d4edda' : '#f8d7da',
          color: result.startsWith('SUCCESS') ? '#155724' : '#721c24',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {result}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Test Credentials:</h4>
        <p>Email: john.doe@example.com</p>
        <p>Password: password123</p>
        <p>Admin: admin@samb-laundry.com / admin123</p>
        
        <h4>Backend Status:</h4>
        <p>URL: {BACKEND_CONFIG.apiURL}</p>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
};

export default SimpleAuthTest;
