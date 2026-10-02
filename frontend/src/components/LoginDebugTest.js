import React, { useState } from 'react';

const LoginDebugTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        addResult('Backend Health', 'ERROR', `Backend returned ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`, null);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        addResult('Backend Health', 'SUCCESS', `Backend is running`, data);
      } else {
        addResult('Backend Health', 'FAILED', `Backend responded with ${response.status}`, data);
      }
    } catch (error) {
      addResult('Backend Health', 'ERROR', `Cannot connect to backend: ${error.message}`, null);
    }
  };

  const testDirectLogin = async () => {
    try {
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
        addResult('Direct Login', 'ERROR', `Backend returned ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`, null);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        addResult('Direct Login', 'SUCCESS', `Login successful`, {
          user: data.data.user.email,
          hasTokens: !!data.data.tokens.accessToken
        });
      } else {
        addResult('Direct Login', 'FAILED', `Login failed: ${data.error?.message}`, data);
      }
    } catch (error) {
      addResult('Direct Login', 'ERROR', `Network error: ${error.message}`, null);
    }
  };

  const testAxiosLogin = async () => {
    try {
      // Import axios dynamically
      const axios = require('axios');
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'john.doe@example.com',
        password: 'password123'
      });

      addResult('Axios Login', 'SUCCESS', `Axios login successful`, {
        user: response.data.data.user.email,
        hasTokens: !!response.data.data.tokens.accessToken
      });
    } catch (error) {
      addResult('Axios Login', 'ERROR', `Axios error: ${error.message}`, {
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const testBackendConfig = () => {
    try {
      const { BACKEND_CONFIG } = require('../config/backendConfig');
      addResult('Backend Config', 'SUCCESS', 'Backend config loaded', BACKEND_CONFIG);
    } catch (error) {
      addResult('Backend Config', 'ERROR', `Config error: ${error.message}`, null);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testBackendConfig();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testDirectLogin();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAxiosLogin();
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '50px auto', 
      border: '2px solid #007bff', 
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>
        LOGIN DEBUG TEST
      </h2>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={runAllTests}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button
          onClick={clearResults}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '15px',
                margin: '10px 0',
                borderRadius: '6px',
                backgroundColor: result.status === 'SUCCESS' ? '#d4edda' : 
                                result.status === 'FAILED' ? '#f8d7da' : '#fff3cd',
                border: `1px solid ${
                  result.status === 'SUCCESS' ? '#c3e6cb' : 
                  result.status === 'FAILED' ? '#f5c6cb' : '#ffeaa7'
                }`
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                [{result.timestamp}] {result.test}: {result.status}
              </div>
              <div style={{ color: '#666', marginBottom: '5px' }}>
                {result.message}
              </div>
              {result.details && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#333', 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '8px', 
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Test Info:</h4>
        <p>Backend URL: http://localhost:5000</p>
        <p>Test Email: john.doe@example.com</p>
        <p>Test Password: password123</p>
        <p>Tests: Backend Health, Config, Direct Login, Axios Login</p>
      </div>
    </div>
  );
};

export default LoginDebugTest;
