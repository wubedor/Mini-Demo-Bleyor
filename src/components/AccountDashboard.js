import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user]);

  const loadUserBookings = useCallback(async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadUserBookings();
    }
  }, [user, loadUserData, loadUserBookings]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user.uid), userData);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  if (loading) {
    return <div className="account-dashboard"><div className="loading">Loading...</div></div>;
  }

  if (!userData) {
    return <div className="account-dashboard"><div className="error">Error loading profile</div></div>;
  }

  return (
    <div className="account-dashboard">
      <div className="dashboard-header">
        <h1>My Account</h1>
        <p>Manage your profile and bookings</p>
      </div>

      {success && <div className="success-message">{success}</div>}

      <div className="dashboard-grid">
        {/* Profile Section */}
        <div className="card profile-card">
          <div className="card-header">
            <h3>Profile Information</h3>
            <button 
              className="edit-btn" 
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={userData.name || ''}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={userData.email || ''}
                    disabled
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={userData.phone || ''}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={userData.address || ''}
                  onChange={(e) => setUserData({...userData, address: e.target.value})}
                />
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{userData.name || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{userData.email || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{userData.phone || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span className="value">{userData.address || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Member Since:</span>
                <span className="value">
                  {userData.memberSince ? new Date(userData.memberSince.toDate()).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Stats */}
        <div className="card stats-card">
          <div className="card-header">
            <h3>Booking Statistics</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{userData.totalBookings || 0}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userData.completedBookings || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userData.cancelledBookings || 0}</div>
              <div className="stat-label">Cancelled</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {userData.totalBookings ? Math.round((userData.completedBookings / userData.totalBookings) * 100) : 0}%
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card bookings-card">
          <div className="card-header">
            <h3>Recent Bookings</h3>
            <a href="/my-bookings" className="view-all-btn">View All</a>
          </div>
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="no-bookings">
                <p>No bookings yet</p>
                <a href="/book" className="book-now-btn">Book Now</a>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <div className="booking-service">{booking.service}</div>
                    <div className="booking-date">
                      {booking.date} at {booking.time}
                    </div>
                  </div>
                  <div 
                    className="booking-status"
                    style={{ color: getStatusColor(booking.status) }}
                  >
                    {booking.status || 'Pending'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="card preferences-card">
          <div className="card-header">
            <h3>Service Preferences</h3>
          </div>
          <div className="preferences-info">
            <div className="preference-item">
              <span className="label">Preferred Service:</span>
              <span className="value">{userData.preferredService || 'Not set'}</span>
            </div>
            <div className="preference-item">
              <span className="label">Preferred Time:</span>
              <span className="value">{userData.preferredTime || 'Not set'}</span>
            </div>
            <div className="preference-item">
              <span className="label">Notifications:</span>
              <span className={`value ${userData.notifications ? 'enabled' : 'disabled'}`}>
                {userData.notifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="preference-item">
              <span className="label">Newsletter:</span>
              <span className={`value ${userData.newsletter ? 'enabled' : 'disabled'}`}>
                {userData.newsletter ? 'Subscribed' : 'Not subscribed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
