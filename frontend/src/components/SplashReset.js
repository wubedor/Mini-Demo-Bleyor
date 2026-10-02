import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { splashScreenUtils } from '../utils/splashScreen';

export default function SplashReset() {
  const navigate = useNavigate();

  useEffect(() => {
    // Reset splash screen
    splashScreenUtils.resetSplash();
    
    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#667eea',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>Splash Screen Reset</h1>
      <p>The splash screen has been reset.</p>
      <p>It will show again on the next fresh app launch.</p>
      <p>Redirecting to home...</p>
    </div>
  );
}
