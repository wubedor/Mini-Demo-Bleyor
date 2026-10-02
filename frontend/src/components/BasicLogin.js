import React, { useState } from 'react';

const BasicLogin = () => {
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setMessage('Attempting login...');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setMessage(`ERROR: Backend returned ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessage(`SUCCESS: Logged in as ${data.data.user.firstName} ${data.data.user.lastName}`);
        
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        
      } else {
        setMessage(`ERROR: ${data.error?.message || 'Login failed'}`);
      }
    } catch (error) {
      setMessage(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    setLoading(true);
    setMessage('Testing backend...');

    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`BACKEND OK: ${data.message}`);
      } else {
        setMessage(`BACKEND ERROR: ${response.status}`);
      }
    } catch (error) {
      setMessage(`BACKEND OFFLINE: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          SAMB Laundry Login
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Processing...' : 'Login'}
        </button>

        <button
          onClick={testBackend}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: message.includes('SUCCESS') || message.includes('OK') ? '#d4edda' : '#f8d7da',
            color: message.includes('SUCCESS') || message.includes('OK') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('SUCCESS') || message.includes('OK') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <h4 style={{ marginBottom: '10px' }}>Test Credentials:</h4>
          <p style={{ margin: '5px 0' }}><strong>Customer:</strong> john.doe@example.com / password123</p>
          <p style={{ margin: '5px 0' }}><strong>Admin:</strong> admin@samb-laundry.com / admin123</p>
          <p style={{ margin: '10px 0', color: '#007bff' }}>Backend: http://localhost:5000</p>
          <p style={{ margin: '5px 0' }}>Check browser console (F12) for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default BasicLogin;
