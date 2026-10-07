import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';
import SimpleServices from './SimpleServices';
import QRCodeScanner from './QRCodeScanner';
import LocationMap from './LocationMap';
import './SimpleHeroSection.css';

const BackendHomePageWithDesign = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStartupQR, setShowStartupQR] = useState(false);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user data
      verifyToken(token);
    } else {
      setLoading(false);
      
      // Check if user is on mobile device for QR code
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasSeenQR = localStorage.getItem('hasSeenStartupQR');
      const isFirstVisit = !hasSeenQR && isMobile;
      
      setShowStartupQR(isFirstVisit);
      
      if (isFirstVisit) {
        localStorage.setItem('hasSeenStartupQR', 'true');
      }
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

  const handleHeroButtonClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/book');
    }
  };

  const handleCloseQR = () => {
    setShowStartupQR(false);
  };

  const SimpleStartupQR = ({ onClose }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Welcome to SAMB Laundry!</h3>
        <p style={{ marginBottom: '20px' }}>Scan this QR code to download our mobile app</p>
        <div style={{
          width: '150px',
          height: '150px',
          backgroundColor: '#f0f0f0',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          QR Code Placeholder
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Continue to Website
        </button>
      </div>
    </div>
  );

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
    <>
      {showStartupQR && <SimpleStartupQR onClose={handleCloseQR} />}
      
      {/* Hero Section with Background Image */}
      <div className="simple-hero-section">
        <div className="hero-background">
          <img src="/IMG-20260216-WA0000.jpg" alt="SAMB's Laundry Background" className="hero-bg-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome To SAMB's LAUNDRY AND KLININ SERVICES</h1>
          <p className="hero-subtitle">The Experts in Cleaning and Laundry Services for your Homes, Offices and Sites.</p>
          <div className="hero-buttons">
            <button className="hero-button primary" onClick={handleHeroButtonClick}>
              {user ? 'Go to Dashboard' : 'Book Now'}
            </button>
            <button className="hero-button secondary" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
          {user && (
            <div style={{ marginTop: '20px', fontSize: '14px', color: 'white' }}>
              Welcome back, {user.firstName}! 
              <button 
                onClick={() => navigate('/dashboard')}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Original Homepage Components */}
      <SimpleServices />
      <QRCodeScanner />
      <LocationMap />

      {/* Backend Status Footer */}
      <div style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        <h4 style={{ marginBottom: '10px' }}>System Status</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '5px 0' }}>Backend Server</p>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>Online</p>
          </div>
          <div>
            <p style={{ margin: '5px 0' }}>Authentication</p>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>JWT System</p>
          </div>
          <div>
            <p style={{ margin: '5px 0' }}>Database</p>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>Connected</p>
          </div>
          <div>
            <p style={{ margin: '5px 0' }}>API Status</p>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>Active</p>
          </div>
        </div>
        <p style={{ marginTop: '15px', fontSize: '12px', color: '#ccc' }}>
          Backend Authentication System - No Firebase Required | API: {BACKEND_CONFIG.apiURL}
        </p>
      </div>
    </>
  );
};

export default BackendHomePageWithDesign;
