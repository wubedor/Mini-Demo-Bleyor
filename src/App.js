import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/Responsive.css';
import './styles/NativeUI.css';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import MyBookings from './components/MyBookings';
import AuthPage from './components/AuthPage';
import AccountSetup from './components/AccountSetup';
import AccountDashboard from './components/AccountDashboard';
import BookingPage from './components/BookingPage';
import AdminDashboard from './components/AdminDashboard';
import QRCodePage from './components/QRCodePage';
import ProtectedRoute from './routing/ProtectedRoute';
import AdminRoute from './routing/AdminRoute';
import OfflineIndicator from './components/OfflineIndicator';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NativeMobileLayout from './components/NativeMobileLayout';

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
  return (
    <div className="App">
      <NativeMobileLayout>
        <OfflineIndicator />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AccountSetup />} />
            <Route path="/app" element={<QRCodePage />} />
            <Route path="/book" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AccountDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <PWAInstallPrompt />
      </NativeMobileLayout>
    </div>
  );
}
