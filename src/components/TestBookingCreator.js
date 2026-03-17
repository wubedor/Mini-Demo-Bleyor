import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './TestBookingCreator.css';

export default function TestBookingCreator() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestBooking = async () => {
    if (!user) {
      setMessage('❌ Please log in first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const testBooking = {
        userId: user.uid,
        service: 'Test Laundry Service',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        address: 'Test Address, Accra, Ghana',
        phone: '+233 20 123 4567',
        notes: 'This is a test booking created for debugging',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), testBooking);
      console.log('✅ Test booking created with ID:', docRef.id);
      setMessage(`✅ Test booking created successfully! ID: ${docRef.id}`);
      
      // Refresh the page after 2 seconds to see the new booking
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating test booking:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-booking-creator">
      <h4>🧪 Test Booking Creator</h4>
      <p>Create a test booking to debug the booking system:</p>
      
      {user ? (
        <div className="user-status">
          <p>✅ Logged in as: <strong>{user.email}</strong></p>
          <button 
            onClick={createTestBooking} 
            disabled={loading}
            className="create-test-btn"
          >
            {loading ? 'Creating...' : '🧪 Create Test Booking'}
          </button>
        </div>
      ) : (
        <div className="user-status">
          <p>❌ Please log in first to create a test booking</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="info">
        <h5>ℹ️ What this does:</h5>
        <ul>
          <li>Creates a sample booking in Firestore</li>
          <li>Associates it with your user account</li>
          <li>Helps test the booking display system</li>
          <li>Page will refresh after creation</li>
        </ul>
      </div>
    </div>
  );
}
