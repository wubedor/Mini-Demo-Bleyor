import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './FirebaseTest.css';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    setUser(authUser);
    
    const testFirebaseConnection = async () => {
      try {
        console.log('🔥 Testing Firebase connection...');
        console.log('📱 Auth user:', authUser);
        console.log('👤 User UID:', authUser?.uid);
        console.log('📧 User email:', authUser?.email);
        
        // Test 1: Try to access the bookings collection with a simple query
        console.log('📋 Testing bookings access...');
        
        const bookingsRef = collection(db, 'bookings');
        
        // First try a simple query without filters
        console.log('🔍 Testing simple list query...');
        const simpleQuery = query(
          bookingsRef,
          limit(1)
        );
        
        try {
          const simpleSnapshot = await getDocs(simpleQuery);
          console.log('✅ Simple query successful!');
          console.log('📊 Simple query results:', simpleSnapshot.docs.length);
          
          if (simpleSnapshot.docs.length > 0) {
            const firstDoc = simpleSnapshot.docs[0];
            console.log('📄 Sample booking data:', firstDoc.data());
            console.log('👤 Booking userId:', firstDoc.data().userId);
            console.log('� Current user UID:', authUser?.uid);
          }
        } catch (simpleError) {
          console.error('❌ Simple query failed:', simpleError);
          console.error('Simple error code:', simpleError.code);
          console.error('Simple error message:', simpleError.message);
          
          // If simple query fails, the issue is with list permissions
          if (simpleError.code === 'permission-denied') {
            setError('❌ List permission denied. Firestore rules need to allow list access.');
            setStatus('❌ List permission error');
            return;
          }
        }
        
        // Test 2: Try user-specific query
        if (authUser) {
          console.log('👤 Testing user-specific bookings query...');
          
          const userBookingsQuery = query(
            bookingsRef,
            where('userId', '==', authUser.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          try {
            const userQuerySnapshot = await getDocs(userBookingsQuery);
            console.log('✅ User query successful!');
            console.log('📊 User bookings count:', userQuerySnapshot.docs.length);
            
            if (userQuerySnapshot.docs.length > 0) {
              console.log('✅ User has access to their bookings');
              const userBooking = userQuerySnapshot.docs[0];
              console.log('📄 User booking data:', userBooking.data());
              setStatus('✅ Firebase connection successful');
            } else {
              console.log('📭 User has no bookings - this is normal');
              setStatus('✅ Firebase connected, but no bookings exist');
            }
          } catch (userError) {
            console.error('❌ User query failed:', userError);
            console.error('User error code:', userError.code);
            console.error('User error message:', userError.message);
            
            if (userError.code === 'permission-denied') {
              setError('❌ User-specific permission denied. The booking might not belong to your account or rules need adjustment.');
              setStatus('❌ User permission error');
            } else {
              setError(`❌ User query error: ${userError.message}`);
              setStatus('❌ User query failed');
            }
          }
        } else {
          console.log('⚠️ No authenticated user');
          setError('⚠️ No authenticated user. Please log in first.');
          setStatus('❌ Not authenticated');
        }
        
      } catch (error) {
        console.error('❌ Firebase connection error:', error);
        console.error('🔍 Error code:', error.code);
        console.error('💬 Error message:', error.message);
        
        let friendlyError = `Firebase error: ${error.message}`;
        
        if (error.code === 'permission-denied') {
          friendlyError = '❌ Permission denied. This could be because:\n• You are not logged in\n• Firestore rules don\'t allow access\n• User ID doesn\'t match booking owner';
        } else if (error.code === 'unavailable') {
          friendlyError = '❌ Network error. Please check your internet connection.';
        } else if (error.code === 'unauthenticated') {
          friendlyError = '❌ Not authenticated. Please log in to access bookings.';
        } else if (error.code === 'failed-precondition') {
          friendlyError = '❌ Firestore rules need to be updated. Please deploy the updated rules.';
        }
        
        setError(friendlyError);
        setStatus('❌ Firebase connection failed');
      }
    };

    if (authUser !== undefined) {
      testFirebaseConnection();
    }
  }, [authUser]);

  return (
    <div className="firebase-test">
      <h3>🔥 Firebase Connection Test</h3>
      
      <div className={`status ${status.includes('successful') ? 'success' : status.includes('failed') || status.includes('error') ? 'error' : 'testing'}`}>
        {status}
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="user-info">
        <h4>👤 Authentication Status:</h4>
        {user ? (
          <div className="user-details">
            <p>✅ Logged in as: {user.email}</p>
            <p>🆔 User ID: {user.uid}</p>
          </div>
        ) : (
          <p>❌ Not logged in</p>
        )}
      </div>
      
      <div className="debug-info">
        <h4>🔧 Debug Information:</h4>
        <p>• Check browser console for detailed logs (F12 → Console)</p>
        <p>• Verify you are logged in to access your bookings</p>
        <p>• If logged in, check if you have any bookings</p>
        <p>• Firestore rules require authentication to read bookings</p>
        <p>• Try booking a service first if you have no bookings</p>
        <p>• If error persists, check if rules need more time to propagate</p>
      </div>
      
      <div className="troubleshooting">
        <h4>🛠️ Quick Fixes:</h4>
        <ul>
          <li><strong>Not logged in?</strong> Go to Login page and sign in</li>
          <li><strong>No bookings?</strong> Book a service first</li>
          <li><strong>Permission error?</strong> Rules might still be propagating (wait 2-5 minutes)</li>
          <li><strong>Network error?</strong> Check your internet connection</li>
          <li><strong>Still failing?</strong> Try refreshing the page after 5 minutes</li>
        </ul>
      </div>
    </div>
  );
}
