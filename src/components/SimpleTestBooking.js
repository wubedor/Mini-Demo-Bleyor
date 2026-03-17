import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function SimpleTestBooking() {
  const { user } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const createTestBooking = async () => {
    if (!user) {
      setResult('❌ Please log in first');
      return;
    }

    setLoading(true);
    setResult('Creating test booking...');

    try {
      const testBooking = {
        userId: user.uid,
        name: 'Test User',
        phone: '123-456-7890',
        service: 'Test Service',
        date: new Date().toISOString().split('T')[0],
        notes: 'This is a test booking',
        createdAt: serverTimestamp(),
        status: 'Pending'
      };

      const docRef = await addDoc(collection(db, 'bookings'), testBooking);
      setResult(`✅ Test booking created! ID: ${docRef.id}`);
      
      // Also try to read it back
      console.log('Test booking created successfully:', docRef.id);
      
    } catch (error) {
      console.error('Test booking failed:', error);
      setResult(`❌ Error: ${error.message} (Code: ${error.code})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '15px', 
      border: '2px solid #28a745', 
      margin: '20px', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🧪 Simple Test Booking</h3>
      <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
      <p><strong>Status:</strong> {result}</p>
      
      <button 
        onClick={createTestBooking}
        disabled={loading || !user}
        style={{ 
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !user ? 'not-allowed' : 'pointer',
          marginRight: '10px'
        }}
      >
        {loading ? 'Creating...' : 'Create Test Booking'}
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        💡 This will help us identify the exact permission issue
      </div>
    </div>
  );
}
