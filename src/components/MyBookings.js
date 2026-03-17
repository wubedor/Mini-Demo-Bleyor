import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc, limit, startAfter } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './MyBookings.css';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState('All');
  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        setLoading(true);
        setErrorMessage('');
        try {
          console.log('Fetching bookings for user:', user.uid);
          
          const bookingsRef = collection(db, 'bookings');
          let bookingsData = [];
          
          // Approach 1: Try user-specific query without compound filters
          try {
            console.log('🔍 Approach 1: User-specific query without status filter');
            const q = query(
              bookingsRef, 
              where('userId', '==', user.uid),
              orderBy('createdAt', 'desc'),
              limit(PAGE_SIZE * 2) // Get more to filter client-side
            );
            
            const querySnapshot = await getDocs(q);
            console.log('✅ Approach 1 successful:', querySnapshot.docs.length);
            
            bookingsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Filter by status client-side if needed
            if (filter !== 'All') {
              bookingsData = bookingsData.filter(booking => 
                booking.status === filter
              );
            }
            
            // Limit to page size
            bookingsData = bookingsData.slice(0, PAGE_SIZE);
            
          } catch (approach1Error) {
            console.warn('❌ Approach 1 failed:', approach1Error.message);
            
            // Approach 2: Try simple query without ordering
            try {
              console.log('🔍 Approach 2: Simple query without ordering');
              const simpleQuery = query(
                bookingsRef,
                where('userId', '==', user.uid),
                limit(PAGE_SIZE * 3)
              );
              
              const simpleSnapshot = await getDocs(simpleQuery);
              console.log('✅ Approach 2 successful:', simpleSnapshot.docs.length);
              
              const allBookings = simpleSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              // Filter client-side
              bookingsData = allBookings.filter(booking => 
                booking.userId === user.uid && 
                (filter === 'All' || booking.status === filter)
              ).slice(0, PAGE_SIZE);
              
              console.log('📊 Filtered bookings:', bookingsData.length);
              
            } catch (approach2Error) {
              console.warn('❌ Approach 2 failed:', approach2Error.message);
              
              // Approach 3: Try getting all bookings and filter
              try {
                console.log('🔍 Approach 3: Basic query with client-side filtering');
                const basicQuery = query(bookingsRef, limit(PAGE_SIZE * 5));
                const basicSnapshot = await getDocs(basicQuery);
                console.log('✅ Approach 3 successful:', basicSnapshot.docs.length);
                
                const allBookings = basicSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                
                bookingsData = allBookings.filter(booking => 
                  booking.userId === user.uid && 
                  (filter === 'All' || booking.status === filter)
                ).slice(0, PAGE_SIZE);
                
                console.log('📊 Basic filtered bookings:', bookingsData.length);
                
              } catch (approach3Error) {
                console.error('❌ All approaches failed:', approach3Error);
                throw approach3Error;
              }
            }
          }
          
          console.log('📋 Final bookings data:', bookingsData);
          setBookings(bookingsData);
          
          if (bookingsData.length === 0) {
            if (filter === 'All') {
              setErrorMessage('No bookings found. Try creating a test booking below!');
            } else {
              setErrorMessage(`No ${filter.toLowerCase()} bookings found. Try changing the filter or create a new booking.`);
            }
          }
          
        } catch (error) {
          console.error("Error fetching bookings: ", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          
          let friendlyMessage = "Failed to fetch bookings. Please try again.";
          
          if (error.code === 'permission-denied') {
            friendlyMessage = "Permission denied. Please ensure you're logged in and the Firestore rules have been updated. Try refreshing the page after 2 minutes.";
          } else if (error.code === 'unavailable') {
            friendlyMessage = "Network error. Please check your internet connection and try again.";
          } else if (error.code === 'unauthenticated') {
            friendlyMessage = "Please log in to view your bookings.";
          } else if (error.code === 'failed-precondition') {
            friendlyMessage = "Firestore index missing. This is being fixed automatically. Please try again in a few minutes.";
          } else if (error.message.includes('index')) {
            friendlyMessage = "Database index is being created. Please try again in 1-2 minutes.";
          }
          
          setErrorMessage(friendlyMessage);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setErrorMessage('Please log in to view your bookings.');
      }
    };

    fetchBookings();
  }, [user, filter]);

  const loadMoreBookings = async () => {
    if (!lastVisible || !user) return;
    setLoadingMore(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      let q;
      if (filter === 'All') {
        q = query(
          bookingsRef, 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          bookingsRef, 
          where('userId', '==', user.uid),
          where('status', '==', filter),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      }
      const querySnapshot = await getDocs(q);
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      const newBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(prev => [...prev, ...newBookings]);
    } catch (error) {
      console.error("Error loading more bookings: ", error);
      setErrorMessage("Failed to load more bookings. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setBookingToDelete(bookingId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      try {
        await deleteDoc(doc(db, "bookings", bookingToDelete));
        setBookings(bookings.filter((booking) => booking.id !== bookingToDelete));
        setSuccessMessage("Booking cancelled successfully.");
        setShowModal(false);
        setBookingToDelete(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error("Error cancelling booking: ", error);
        setErrorMessage("Failed to cancel booking. Please try again.");
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setBookingToDelete(null);
  };

  if (loading) return <div className="my-bookings-container"><LoadingSpinner /></div>;

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      <div className="filter-container">
        <label htmlFor="status-filter">Status: </label>
        <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {successMessage && <div className="my-bookings-message success">{successMessage}</div>}
      {errorMessage && <div className="my-bookings-message error">{errorMessage}</div>}
      {bookings.length === 0 ? (
        <p className="no-bookings">You haven't made any bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <span className="booking-service">{booking.service}</span>
                <span className={`booking-status ${booking.status?.toLowerCase() || 'pending'}`}>
                  {booking.status || 'Pending'}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Address:</strong> {booking.address}</p>
                {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                {(booking.status === 'Pending' || !booking.status) && (
                  <button className="cancel-booking-btn" onClick={() => handleCancelBooking(booking.id)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMoreBookings} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={closeModal}>No, Keep it</button>
              <button className="modal-btn confirm" onClick={confirmDelete}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}