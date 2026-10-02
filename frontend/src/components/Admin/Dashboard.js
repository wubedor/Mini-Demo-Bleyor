import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../../config/backendConfig';
import './Dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch recent bookings
      const bookingsResponse = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/bookings?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch all users with their order history
      const usersResponse = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/users?includeOrders=true&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(statsResponse.data.data);
      setRecentBookings(bookingsResponse.data.data.bookings || []);
      setRecentUsers(usersResponse.data.data.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/bookings/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/users/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="btn btn-primary"
          >
            Manage Bookings
          </button>
          <button 
            onClick={() => navigate('/admin/users')}
            className="btn btn-secondary"
          >
            Manage Users
          </button>
          <button 
            onClick={() => navigate('/admin/services')}
            className="btn btn-secondary"
          >
            Manage Services
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bookings">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
        </div>
      </div>

      {/* Booking Status Chart */}
      <div className="chart-container">
        <h2>Booking Status Overview</h2>
        <div className="status-bars">
          <div className="status-bar">
            <span className="status-label">Completed</span>
            <div className="progress-bar">
              <div 
                className="progress-fill completed" 
                style={{ width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="status-count">{stats.completedBookings}</span>
          </div>
          <div className="status-bar">
            <span className="status-label">Pending</span>
            <div className="progress-bar">
              <div 
                className="progress-fill pending" 
                style={{ width: `${stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="status-count">{stats.pendingBookings}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-grid">
        <div className="activity-card">
          <h3>Recent Bookings</h3>
          <div className="activity-list">
            {recentBookings.length === 0 ? (
              <p className="no-activity">No recent bookings</p>
            ) : (
              recentBookings.map(booking => (
                <div key={booking._id} className="activity-item">
                  <div className="activity-info">
                    <h4>{booking.service?.name || 'Unknown Service'}</h4>
                    <p>{booking.user?.fullName || 'Unknown User'}</p>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="activity-actions">
                    <button 
                      onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleBookingAction(booking._id, 'confirm')}
                        className="btn btn-sm btn-success"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="btn btn-outline view-all-btn"
          >
            View All Bookings
          </button>
        </div>

        <div className="activity-card">
          <h3>Customers & Orders</h3>
          <div className="activity-list">
            {recentUsers.length === 0 ? (
              <p className="no-activity">No customers found</p>
            ) : (
              recentUsers.map(user => (
                <div key={user._id} className="activity-item customer-item">
                  <div className="activity-info">
                    <h4>{user.firstName} {user.lastName}</h4>
                    <p>{user.email}</p>
                    <div className="customer-details">
                      <span className="detail-item">
                        <i className="fas fa-sign-in-alt"></i>
                        Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                      <span className="detail-item">
                        <i className="fas fa-shopping-cart"></i>
                        Orders: {user.orderCount || 0}
                      </span>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {user.orders && user.orders.length > 0 && (
                      <div className="user-orders">
                        <p className="orders-title">Recent Orders:</p>
                        {user.orders.slice(0, 3).map(order => (
                          <div key={order._id} className="order-preview">
                            <span className="order-service">{order.service?.name || 'Unknown'}</span>
                            <span className={`order-status ${order.status}`}>{order.status}</span>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="activity-actions">
                    <button 
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/users')}
            className="btn btn-outline view-all-btn"
          >
            View All Customers
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            onClick={() => navigate('/admin/bookings/new')}
            className="action-btn"
          >
            <i className="fas fa-plus"></i>
            <span>Create Booking</span>
          </button>
          <button 
            onClick={() => navigate('/admin/services/new')}
            className="action-btn"
          >
            <i className="fas fa-plus"></i>
            <span>Add Service</span>
          </button>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="action-btn"
          >
            <i className="fas fa-chart-bar"></i>
            <span>View Reports</span>
          </button>
          <button 
            onClick={() => navigate('/admin/settings')}
            className="action-btn"
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
