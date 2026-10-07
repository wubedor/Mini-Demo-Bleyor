import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AccountDashboard.css';

export default function AccountDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');

  const loadUserData = useCallback(async () => {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const loadUserBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadUserBookings();
    setLoading(false);
  }, [loadUserData, loadUserBookings]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put('http://localhost:5000/api/users/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="account-dashboard"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="account-dashboard">
      <div className="dashboard-container">
        <h1>Account Dashboard</h1>

        {success && <div className="success-message">{success}</div>}

        <div className="dashboard-section">
          <h2>Profile Information</h2>
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
                  onChange={(e) => {
                    const nameParts = e.target.value.split(' ');
                    setUserData({
                      ...userData,
                      firstName: nameParts[0],
                      lastName: nameParts.slice(1).join(' ') || ''
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userData?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={userData?.phone || ''}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={userData?.address || ''}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="cancel-button">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <p><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
              <p><strong>Address:</strong> {userData?.address || 'Not provided'}</p>
              <p><strong>City:</strong> {userData?.city || 'Not provided'}</p>
              <p><strong>Region:</strong> {userData?.region || 'Not provided'}</p>
              <p><strong>Role:</strong> {userData?.role}</p>
              <button onClick={() => setEditing(true)} className="edit-button">Edit Profile</button>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Recent Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet</p>
          ) : (
            <div className="bookings-list">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="booking-item">
                  <p><strong>Service:</strong> {booking.serviceId?.name || 'N/A'}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                  <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
