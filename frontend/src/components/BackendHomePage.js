import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';

const BackendHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user data
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f5f5f5'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>SAMB Laundry Services</h1>
        <div>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: 'white',
        margin: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          {user ? `Welcome back, ${user.firstName}!` : 'Professional Laundry Services'}
        </h2>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
          {user 
            ? 'Manage your laundry orders and track your services'
            : 'Fast, reliable, and affordable laundry solutions for your busy life'
          }
        </p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          
          {!user && (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#007bff',
                border: '2px solid #007bff',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Login
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '40px 20px',
        margin: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>Our Services</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#007bff',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              &#128;
            </div>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Standard Laundry</h4>
            <p style={{ color: '#666', margin: 0 }}>Professional washing and folding services</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              &#128;
            </div>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Dry Cleaning</h4>
            <p style={{ color: '#666', margin: 0 }}>Expert dry cleaning for delicate garments</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ffc107',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              &#128;
            </div>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Ironing Service</h4>
            <p style={{ color: '#666', margin: 0 }}>Perfect ironing for all your clothes</p>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section style={{
        padding: '20px',
        margin: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#333', marginBottom: '15px' }}>System Status</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p style={{ margin: '5px 0', color: '#666' }}>Backend Server</p>
            <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>Online</p>
          </div>
          <div>
            <p style={{ margin: '5px 0', color: '#666' }}>Authentication</p>
            <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>JWT System</p>
          </div>
          <div>
            <p style={{ margin: '5px 0', color: '#666' }}>Database</p>
            <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>Connected</p>
          </div>
          <div>
            <p style={{ margin: '5px 0', color: '#666' }}>API Status</p>
            <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>Active</p>
          </div>
        </div>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          No Firebase - Backend Only Authentication
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '20px',
        textAlign: 'center',
        margin: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '5px 0', color: '#666' }}>
          Backend Authentication System - No Firebase Required
        </p>
        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
          API: {BACKEND_CONFIG.apiURL} | Status: Operational
        </p>
      </footer>
    </div>
  );
};

export default BackendHomePage;
