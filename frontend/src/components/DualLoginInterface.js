import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DualLoginInterface.css';

const DualLoginInterface = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('customer');
  const [customerData, setCustomerData] = useState({
    email: 'john.doe@example.com',
    password: 'password123'
  });
  const [adminData, setAdminData] = useState({
    email: 'admin@samb-laundry.com',
    password: 'admin123'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (userData, userType) => {
    setLoading(true);
    setMessage(`Attempting ${userType} login...`);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
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
        const user = data.data.user;
        const tokens = data.data.tokens;
        
        setMessage(`SUCCESS: Logged in as ${user.firstName} ${user.lastName} (${user.role})`);
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('userRole', user.role);
        
        // Redirect based on user role
        setTimeout(() => {
          if (user.role === 'admin' || user.role === 'super_admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
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
    setMessage('Testing backend connection...');

    try {
      const response = await fetch('http://localhost:5000/health');
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text.slice(0, 180);
        setMessage(`BACKEND ERROR: ${response.status} ${response.statusText} (${contentType || 'unknown content-type'}): ${snippet}`);
        return;
      }

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

  const CustomerLoginForm = () => (
    <div className="customer-login">
      <div className="login-header">
        <h3 style={{ color: '#007bff', marginBottom: '10px' }}>Customer Login</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Access your laundry services and bookings
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Email Address
        </label>
        <input
          type="email"
          value={customerData.email}
          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
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
          value={customerData.password}
          onChange={(e) => setCustomerData({...customerData, password: e.target.value})}
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
        onClick={() => handleLogin(customerData, 'customer')}
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
        {loading ? 'Processing...' : 'Customer Login'}
      </button>

      <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>Test: john.doe@example.com / password123</p>
        <p style={{ marginTop: '10px' }}>
          <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
            Don't have an account? Register here
          </a>
        </p>
      </div>
    </div>
  );

  const AdminLoginForm = () => (
    <div className="admin-login">
      <div className="login-header">
        <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Administrator Login</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Access system administration and management
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Admin Email
        </label>
        <select
          value={adminData.email}
          onChange={(e) => setAdminData({...adminData, email: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            fontSize: '16px',
            boxSizing: 'border-box',
            marginBottom: '10px'
          }}
        >
          <option value="">Select Administrator Email...</option>
          <optgroup label="Super Administrators">
            <option value="bleyorsampson6@gmail.com">bleyorsampson6@gmail.com (Bleyor Sampson)</option>
            <option value="solomonabrantieotu@gmail.com">solomonabrantieotu@gmail.com (Solomon Abrantie)</option>
            <option value="samb@samb-laundry.com">samb@samb-laundry.com (SAMB Owner)</option>
            <option value="admin@samb-laundry.com">admin@samb-laundry.com (Admin User)</option>
          </optgroup>
          <optgroup label="Administrators">
            <option value="anumemma242@gmail.com">anumemma242@gmail.com (Anum Emma)</option>
            <option value="Cdanieles002@gmail.com">Cdanieles002@gmail.com (Daniel Es)</option>
            <option value="liliandikutu@gmail.com">liliandikutu@gmail.com (Lilian Dikutu)</option>
            <option value="acquahgifty2004@gmail.com">acquahgifty2004@gmail.com (Acquah Gifty)</option>
            <option value="manager@samb-laundry.com">manager@samb-laundry.com (Manager User)</option>
            <option value="support@samb-laundry.com">support@samb-laundry.com (Support Team)</option>
          </optgroup>
        </select>
        <input
          type="email"
          value={adminData.email}
          onChange={(e) => setAdminData({...adminData, email: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
          placeholder="Or enter admin email manually"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Admin Password
        </label>
        <input
          type="password"
          value={adminData.password}
          onChange={(e) => setAdminData({...adminData, password: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
          placeholder="Enter admin password"
        />
      </div>

      <button
        onClick={() => handleLogin(adminData, 'admin')}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: loading ? '#ccc' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {loading ? 'Processing...' : 'Admin Login'}
      </button>

      <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p style={{ marginBottom: '10px' }}><strong>Administrator Credentials:</strong></p>
        <p style={{ fontWeight: 'bold', color: '#dc3545' }}>Super Administrators:</p>
        <p>bleyorsampson6@gmail.com / admin123</p>
        <p>solomonabrantieotu@gmail.com / admin123</p>
        <p>samb@samb-laundry.com / samb123</p>
        <p>admin@samb-laundry.com / admin123</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#007bff' }}>Administrators:</p>
        <p>anumemma242@gmail.com / admin123</p>
        <p>Cdanieles002@gmail.com / admin123</p>
        <p>liliandikutu@gmail.com / admin123</p>
        <p>acquahgifty2004@gmail.com / admin123</p>
        <p>manager@samb-laundry.com / manager123</p>
        <p>support@samb-laundry.com / support123</p>
        <p style={{ marginTop: '10px', color: '#dc3545', fontWeight: 'bold' }}>
          Restricted Access - Authorized Personnel Only
        </p>
      </div>
    </div>
  );

  return (
    <div className="dual-login-container">
      <div className="login-card">
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          SAMB Laundry Portal
        </h1>
        
        {/* Login Type Selector */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '30px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '4px' 
        }}>
          <button
            onClick={() => setLoginType('customer')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: loginType === 'customer' ? '#007bff' : 'transparent',
              color: loginType === 'customer' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Customer
          </button>
          <button
            onClick={() => setLoginType('admin')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: loginType === 'admin' ? '#dc3545' : 'transparent',
              color: loginType === 'admin' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Administrator
          </button>
        </div>

        {/* Login Forms */}
        {loginType === 'customer' ? <CustomerLoginForm /> : <AdminLoginForm />}

        {/* Backend Test */}
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

        {/* Message Display */}
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

        {/* Footer Info */}
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          borderTop: '1px solid #ddd', 
          paddingTop: '15px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Backend:</strong> http://localhost:5000
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>System Status:</strong> JWT Authentication
          </p>
          <p style={{ margin: '10px 0', color: '#007bff' }}>
            <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
              Back to Homepage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DualLoginInterface;
