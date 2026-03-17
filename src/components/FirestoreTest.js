import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirestoreTest() {
  const [testResult, setTestResult] = useState('Testing...');
  const [error, setError] = useState('');

  useEffect(() => {
    const testFirestoreAccess = async () => {
      try {
        console.log('🔍 Testing Firestore access...');
        
        // Test reading services collection
        const servicesQuery = collection(db, 'services');
        const querySnapshot = await getDocs(servicesQuery);
        
        console.log('✅ Services access successful:', querySnapshot.docs.length, 'documents');
        setTestResult(`✅ Success! Found ${querySnapshot.docs.length} services`);
        
      } catch (err) {
        console.error('❌ Firestore access failed:', err);
        setError(`❌ Error: ${err.message}`);
        setTestResult('❌ Failed');
      }
    };

    testFirestoreAccess();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firestore Permissions Test</h3>
      <p><strong>Status:</strong> {testResult}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
