import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function QuickPermissionTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const runTests = async () => {
      const results = [];
      
      if (!user) {
        results.push({ test: 'User Auth', status: '❌', message: 'No user logged in' });
        setTestResults(results);
        return;
      }
      
      results.push({ test: 'User Auth', status: '✅', message: `User: ${user.email}` });

      // Test 1: Try to read all bookings (no filters)
      try {
        const allBookingsQuery = collection(db, 'bookings');
        const snapshot = await getDocs(allBookingsQuery);
        results.push({ test: 'Read All Bookings', status: '✅', message: `Found ${snapshot.docs.length} bookings` });
      } catch (error) {
        results.push({ test: 'Read All Bookings', status: '❌', message: error.message });
      }

      // Test 2: Try to read user-specific bookings
      try {
        const userBookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(userBookingsQuery);
        results.push({ test: 'Read User Bookings', status: '✅', message: `Found ${snapshot.docs.length} user bookings` });
      } catch (error) {
        results.push({ test: 'Read User Bookings', status: '❌', message: error.message });
      }

      // Test 3: Try to read services
      try {
        const servicesQuery = collection(db, 'services');
        const snapshot = await getDocs(servicesQuery);
        results.push({ test: 'Read Services', status: '✅', message: `Found ${snapshot.docs.length} services` });
      } catch (error) {
        results.push({ test: 'Read Services', status: '❌', message: error.message });
      }

      setTestResults(results);
    };

    runTests();
  }, [user]);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      margin: '20px', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🔧 Firestore Permission Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current User:</strong> {user ? user.email : 'Not logged in'}
      </div>
      {testResults.map((result, index) => (
        <div key={index} style={{ 
          margin: '8px 0', 
          padding: '8px', 
          backgroundColor: result.status === '✅' ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          <strong>{result.test}:</strong> {result.status} {result.message}
        </div>
      ))}
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        💡 If you see ❌ errors, update your Firestore rules in Firebase Console
      </div>
    </div>
  );
}
