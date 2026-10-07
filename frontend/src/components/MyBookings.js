import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setBookings(response.data.data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setErrorMessage('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(bookings.filter((booking) => booking._id !== bookingToDelete));
      setSuccessMessage('Booking cancelled successfully.');
      setShowModal(false);
      setBookingToDelete(null);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting booking:', error);
      setErrorMessage('Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'All') return true;
    return booking.status === filter;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <h1>My Bookings</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="filter-controls">
          <label>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>Booking #{booking._id.slice(-6)}</h3>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                </div>
                <div className="booking-details">
                  <p><strong>Service:</strong> {booking.serviceId?.name || 'N/A'}</p>
                  <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                  <p><strong>Address:</strong> {booking.address || 'N/A'}</p>
                </div>
                {booking.status === 'pending' && (
                  <button
                    onClick={() => {
                      setBookingToDelete(booking._id);
                      setShowModal(true);
                    }}
                    className="cancel-button"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Cancel Booking</h3>
              <p>Are you sure you want to cancel this booking?</p>
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="cancel-btn">
                  No, Keep It
                </button>
                <button onClick={handleDeleteBooking} className="confirm-btn">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}