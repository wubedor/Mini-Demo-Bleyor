import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleWorkingLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setResult('Testing login...');

    try {
      console.log('Attempting login with:', { email, password });
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setResult(`ERROR: Backend returned ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResult(`SUCCESS: Logged in as ${data.data.user.email}`);
        
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } else {
        setResult(`ERROR: ${data.error?.message || data.message || 'Login failed'}`);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setResult(`NETWORK ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing backend connection...');

    try {
      const response = await fetch('http://localhost:5000/health');
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setResult(`BACKEND ERROR: ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setResult(`BACKEND OK: ${data.message}`);
      } else {
        setResult(`BACKEND ERROR: ${response.status}`);
      }
    } catch (error) {
      setResult(`BACKEND OFFLINE: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '500px', 
      margin: '50px auto', 
      border: '2px solid #007bff', 
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>
        SIMPLE WORKING LOGIN
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testBackend}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend'}
        </button>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: result.includes('SUCCESS') || result.includes('OK') ? '#d4edda' : '#f8d7da',
          color: result.includes('SUCCESS') || result.includes('OK') ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <h4>Quick Test Credentials:</h4>
        <p>Email: john.doe@example.com</p>
        <p>Password: password123</p>
        <p>Admin: admin@samb-laundry.com / admin123</p>
        
        <h4>Debug Info:</h4>
        <p>Backend URL: http://localhost:5000</p>
        <p>Check browser console (F12) for detailed logs</p>
        <p>Test backend first, then try login</p>
      </div>
    </div>
  );
};

export default SimpleWorkingLogin;
