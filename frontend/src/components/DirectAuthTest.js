import React, { useState } from 'react';

const DirectAuthTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectAuth = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Direct fetch to backend - no axios, no context, just pure API call
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john.doe@example.com',
          password: 'password123'
        })
      });

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setResult(`ERROR: Backend returned ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setResult(`SUCCESS: ${data.message}\nUser: ${data.data.user.email}\nTokens: ${data.data.tokens ? 'Received' : 'Missing'}`);
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
      } else {
        setResult(`ERROR: ${data.error?.message || data.message}`);
      }
      
    } catch (error) {
      setResult(`NETWORK ERROR: ${error.message}\n\nCheck:\n1. Backend running on localhost:5000?\n2. CORS configured?\n3. Network connectivity?`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setLoading(true);
    setResult('Checking backend health...');

    try {
      const response = await fetch('http://localhost:5000/health');
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setResult(`BACKEND HEALTH: FAILED\nStatus: ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setResult(`BACKEND HEALTH: OK\nStatus: ${data.status}\nMessage: ${data.message}\nServer: ${data.environment}`);
      } else {
        setResult(`BACKEND HEALTH: FAILED\nStatus: ${response.status}`);
      }
      
    } catch (error) {
      setResult(`BACKEND UNREACHABLE: ${error.message}\n\nMake sure backend is running on localhost:5000`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '50px auto', 
      border: '2px solid #007bff', 
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#007bff', textAlign: 'center' }}>DIRECT AUTHENTICATION TEST</h2>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>This bypasses all React components and tests the API directly</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testBackendHealth}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend Health'}
        </button>

        <button
          onClick={testDirectAuth}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px'
        }}>
          <strong>Result:</strong><br />
          {result}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h4>Test Info:</h4>
        <p>Backend URL: http://localhost:5000</p>
        <p>Test Email: john.doe@example.com</p>
        <p>Test Password: password123</p>
        <p>Check browser console (F12) for detailed network logs</p>
      </div>
    </div>
  );
};

export default DirectAuthTest;
