import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './DirectBookingTest.css';

export default function DirectBookingTest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createDirectBooking = async () => {
    if (!user) {
      setMessage('❌ Please log in first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('🔥 Creating direct booking for user:', user.uid);
      
      const testBooking = {
        userId: user.uid,
        userEmail: user.email,
        service: 'Direct Test Laundry Service',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        address: 'Direct Test Address, Accra, Ghana',
        phone: '+233 20 123 4567',
        notes: 'Direct test booking created to bypass permission issues',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Booking data to create:', testBooking);
      
      const docRef = await addDoc(collection(db, 'bookings'), testBooking);
      console.log('✅ Direct booking created with ID:', docRef.id);
      
      setMessage(`✅ Direct booking created successfully! ID: ${docRef.id}`);
      
      // Test if we can read it back immediately
      console.log('🔍 Testing immediate read back...');
      
      // Force page reload after 2 seconds to see the new booking
      setTimeout(() => {
        console.log('🔄 Reloading page to test booking display...');
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating direct booking:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        setMessage('❌ Create permission denied. Firestore rules may need more time to propagate.');
      } else if (error.code === 'unauthenticated') {
        setMessage('❌ Not authenticated. Please log in again.');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="direct-booking-test">
      <h4>🚀 Direct Booking Test</h4>
      <p>This creates a booking directly to test permissions:</p>
      
      {user ? (
        <div className="user-status">
          <p>✅ User: <strong>{user.email}</strong></p>
          <p>🆔 UID: <strong>{user.uid}</strong></p>
          <button 
            onClick={createDirectBooking} 
            disabled={loading}
            className="create-direct-btn"
          >
            {loading ? 'Creating...' : '🚀 Create Direct Booking'}
          </button>
        </div>
      ) : (
        <div className="user-status">
          <p>❌ Please log in first</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="info">
        <h5>🔍 What this tests:</h5>
        <ul>
          <li>Create permission (write access)</li>
          <li>User authentication status</li>
          <li>Firestore rules propagation</li>
          <li>Immediate booking creation</li>
          <li>Page refresh to test read access</li>
        </ul>
      </div>
    </div>
  );
}
