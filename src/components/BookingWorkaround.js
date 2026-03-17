import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './BookingWorkaround.css';

export default function BookingWorkaround() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Ready to test');
  const [testBookingId, setTestBookingId] = useState('');

  const createAndReadBooking = async () => {
    if (!user) {
      setStatus('❌ Please log in first');
      return;
    }

    setStatus('🔄 Creating test booking...');
    
    try {
      // Step 1: Create a test booking
      const bookingData = {
        userId: user.uid,
        userEmail: user.email,
        service: 'Workaround Test Booking',
        date: new Date().toISOString().split('T')[0],
        time: '2:30 PM',
        address: 'Test Address, Accra, Ghana',
        phone: '+233 20 123 4567',
        notes: 'Created via workaround to test permissions',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Creating booking:', bookingData);
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('✅ Booking created with ID:', docRef.id);
      setTestBookingId(docRef.id);

      setStatus('🔍 Testing read access...');
      
      // Step 2: Try to read it back immediately
      const bookingDoc = await getDoc(doc(db, 'bookings', docRef.id));
      
      if (bookingDoc.exists()) {
        console.log('✅ Successfully read booking back:', bookingDoc.data());
        setStatus('✅ SUCCESS! Both create and read permissions work!');
        
        // Step 3: Trigger page reload to test the main booking system
        setTimeout(() => {
          console.log('🔄 Reloading page to test main booking system...');
          window.location.reload();
        }, 2000);
        
      } else {
        console.error('❌ Could not read booking back');
        setStatus('❌ Create worked, but read failed');
      }
      
    } catch (error) {
      console.error('❌ Workaround failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        setStatus('❌ Permission denied. Even create access is blocked.');
      } else if (error.code === 'unauthenticated') {
        setStatus('❌ Not authenticated. Please log in again.');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="booking-workaround">
      <h4>🛠️ Booking Permission Workaround</h4>
      <p>This tests both create and read permissions in one step:</p>
      
      <div className="status-display">
        <p><strong>Status:</strong> {status}</p>
        {testBookingId && (
          <p><strong>Test Booking ID:</strong> {testBookingId}</p>
        )}
      </div>
      
      {user && (
        <button 
          onClick={createAndReadBooking}
          className="workaround-btn"
        >
          🛠️ Test Create + Read
        </button>
      )}
      
      <div className="explanation">
        <h5>🔧 How This Works:</h5>
        <ol>
          <li>Creates a test booking (tests write permission)</li>
          <li>Immediately reads it back (tests read permission)</li>
          <li>If both work, reloads page to test main system</li>
          <li>Bypasses list permission issues</li>
        </ol>
        
        <h5>📊 Expected Results:</h5>
        <ul>
          <li>✅ <strong>Success:</strong> Both permissions work, page reloads</li>
          <li>❌ <strong>Permission denied:</strong> Rules need more time</li>
          <li>❌ <strong>Other error:</strong> Check console for details</li>
        </ul>
      </div>
    </div>
  );
}
