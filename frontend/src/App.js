import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { enforceHTTPS, trackDomainUsage } from './config/domain';
import './App.css';
import './styles/Responsive.css';
import './styles/NativeUI.css';

import { AppProvider } from './context/AppContext';
import { SecurityProvider } from './context/SecurityContext';
import { BackendAuthProvider } from './context/BackendAuthContext';
import { AuthProvider } from './context/AuthContext';
import WorkingAuthPage from './components/WorkingAuthPage';
import DashboardPage from './components/DashboardPage';
import SplashScreenFixed from './components/SplashScreenFixed';
import Header from './components/Header';
import Footer from './components/Footer';
import BackendHomePageWithDesign from './components/BackendHomePageWithDesign';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import MyBookings from './components/MyBookings';
import ProfilePage from './components/ProfilePage';
import MobileLogin from './components/MobileLogin';
import MobileAppInstall from './components/MobileAppInstall';
import TestBackendAuth from './components/TestBackendAuth';
import InstallAlert from './components/InstallAlert';
import MobileAuth from './components/MobileAuth';
import AccountSetup from './components/AccountSetup';
import AccountDashboard from './components/AccountDashboard';
import BookingPage from './components/BookingPage';
import AdminDashboard from './components/AdminDashboard';
import EmployeePage from './components/EmployeePage';
import JobApplicationsPage from './components/JobApplicationsPage';
import MyJobApplications from './components/MyJobApplications';
import QRCodePage from './components/QRCodePage';
import PasswordReset from './components/PasswordReset';
import PhoneAuth from './components/PhoneAuth';
import SimpleAuthTest from './components/SimpleAuthTest';
import DirectAuthTest from './components/DirectAuthTest';
import LoginDebugTest from './components/LoginDebugTest';
import SimpleWorkingLogin from './components/SimpleWorkingLogin';
import BasicLogin from './components/BasicLogin';
import DualLoginInterface from './components/DualLoginInterface';
import ModernLogin from './components/ModernLogin';
import SimpleTest from './components/SimpleTest';
import NotFound from './components/NotFound';
import SplashReset from './components/SplashReset';
import FirebaseAuth from './components/FirebaseAuth';
import FirebaseTest from './components/FirebaseTest';
import ProtectedRoute from './routing/ProtectedRoute';
import SecureAdminRoute from './routing/SecureAdminRoute';
import BackendAdminRoute from './routing/BackendAdminRoute';
import AdminRoutes from './routes/AdminRoutes';
import OfflineIndicator from './components/OfflineIndicator';
import NativeMobileLayout from './components/NativeMobileLayout';
import MobileSecurityMonitor from './components/MobileSecurityMonitor';
import { initializeMobileAuth } from './utils/mobileAuth';
import mobileAppSecurity from './utils/mobileAppSecurity';
import { splashScreenUtils } from './utils/splashScreen';
import FirebaseStatus from './components/FirebaseStatus';
import UniversalPWAInstall from './components/UniversalPWAInstall';
import UserDataProtection from './components/UserDataProtection';
import AppInstallQR from './components/AppInstallQR';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('App: Initializing app');
    
    // Enforce HTTPS in production
    enforceHTTPS();
    
    // Track domain usage
    trackDomainUsage();
    
    // Initialize mobile app security
    mobileAppSecurity.init();
  }, []);

  useEffect(() => {
    console.log('App: Initializing mobile auth and checking splash screen');
    
    // Temporarily disable splash screen for testing
    console.log('App: Skipping splash screen');
    setShowSplash(false);
    setSplashComplete(true);
    
    // Initialize mobile auth
    initializeMobileAuth(navigate);
  }, [navigate]);

  // Show splash screen while loading
  if (showSplash && !splashComplete) {
    console.log('🚀 App: Rendering splash screen');
    console.log('showSplash:', showSplash, 'splashComplete:', splashComplete);
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'linear-gradient(135deg, #f2f7ff 0%, #dfeaff 35%, #e4e9ff 100%)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <img
          src="/SAMBS.png"
          alt="SAMB's Laundry logo"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.18,
            filter: 'blur(1.5px) saturate(1.1)'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '32px',
            gap: '18px'
          }}
        >
          <img
            src="/SAMBS.png"
            alt="SAMB's Laundry logo"
            style={{
              width: 'min(72vw, 640px)',
              maxWidth: '640px',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 18px 35px rgba(47, 79, 115, 0.22))'
            }}
          />

          <div
            style={{
              color: '#123d72',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              textShadow: '0 8px 24px rgba(18, 61, 114, 0.12)'
            }}
          >
            SAMB's
          </div>
        </div>
      </div>
    );
  }

  console.log('App: Rendering main app');
  return (
    <AuthProvider>
      <BackendAuthProvider>
        <AppProvider>
          <SecurityProvider>
            <div className="App">
              <NativeMobileLayout>
                <MobileSecurityMonitor />
                <OfflineIndicator />
                <UniversalPWAInstall />
                <MobileAppInstall />
                <InstallAlert />
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<BackendHomePageWithDesign />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<ModernLogin />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/test-auth" element={<TestBackendAuth />} />
                    <Route path="/simple-auth" element={<SimpleAuthTest />} />
                    <Route path="/direct-auth" element={<DirectAuthTest />} />
                    <Route path="/login-debug" element={<LoginDebugTest />} />
                    <Route path="/simple-login" element={<SimpleWorkingLogin />} />
                    <Route path="/dual-login" element={<DualLoginInterface />} />
                    <Route path="/mobile-login" element={<MobileLogin />} />
                    <Route path="/phone-auth" element={<PhoneAuth />} />
                    <Route path="/mobile-auth" element={<MobileAuth />} />
                    <Route path="/register" element={<AccountSetup />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route path="/splash" element={<SplashScreenFixed />} />
                    <Route path="/test-splash" element={<SplashScreenFixed />} />
                    <Route path="/reset-splash" element={<SplashReset />} />
                    <Route path="/firebase-auth" element={<FirebaseAuth />} />
                    <Route path="/firebase-test" element={<FirebaseTest />} />
                    <Route path="/account-dashboard" element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>} />
                    <Route path="/admin-dashboard" element={<BackendAdminRoute><AdminDashboard /></BackendAdminRoute>} />
                    <Route path="/job-applications" element={<BackendAdminRoute><JobApplicationsPage /></BackendAdminRoute>} />
                    <Route path="/my-applications" element={<ProtectedRoute><MyJobApplications /></ProtectedRoute>} />
                    <Route path="/employees" element={<ProtectedRoute><EmployeePage /></ProtectedRoute>} />
                    <Route path="/admin/*" element={<BackendAdminRoute><AdminRoutes /></BackendAdminRoute>} />
                    <Route path="/user-data-protection" element={<ProtectedRoute><UserDataProtection /></ProtectedRoute>} />
                    <Route path="/firebase-status" element={<FirebaseStatus />} />
                    <Route path="/app" element={<QRCodePage />} />
                    <Route path="/install" element={<AppInstallQR />} />
                    <Route path="/book" element={<BookingPage />} />
                    <Route path="/my-bookings" element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </NativeMobileLayout>
            </div>
          </SecurityProvider>
        </AppProvider>
      </BackendAuthProvider>
    </AuthProvider>
  );
}
