import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BACKEND_CONFIG.apiURL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.data.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/login');
      }
    };

    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BACKEND_CONFIG.apiURL}/services`);
        setServices(response.data.data.services || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${BACKEND_CONFIG.apiURL}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    fetchUserData();
    fetchServices();
    fetchBookings();
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>SAMB Laundry Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {user && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Welcome, {user.firstName}!</h2>
            <p style={{ color: '#666', margin: '5px 0' }}>Email: {user.email}</p>
            <p style={{ color: '#666', margin: '5px 0' }}>Role: {user.role}</p>
            <p style={{ color: '#666', margin: '5px 0' }}>Member Since: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        <section className="dashboard-services">
          <h2 className="dashboard-services-title">Available Services</h2>
          {services.length > 0 ? (
            <div className="dashboard-services-grid">
              {services.map((service) => (
                <article className="dashboard-service-card" key={service._id}>
                  <h3 className="dashboard-service-badge">{service.name}</h3>
                  <p className="dashboard-service-description">
                    {service.description || 'Professional laundry service'}
                  </p>
                  <button
                    type="button"
                    className="dashboard-service-button"
                    onClick={() => navigate('/book', { state: { selectedService: service.name } })}
                  >
                    Book This Service
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="dashboard-services-empty">Loading services...</p>
          )}
        </section>

        <section className="dashboard-bookings">
          <div className="dashboard-bookings-header">
            <h2>My Recent Bookings</h2>
            <button type="button" onClick={() => navigate('/my-bookings')}>View All</button>
          </div>
          {bookings.length === 0 ? (
            <p className="dashboard-bookings-empty">No bookings yet.</p>
          ) : (
            <div className="dashboard-bookings-list">
              {bookings.slice(0, 5).map((booking) => (
                <div className="dashboard-booking-item" key={booking._id}>
                  <div>
                    <strong>{booking.serviceName || booking.service?.name || 'Service booking'}</strong>
                    <span>
                      {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                    </span>
                  </div>
                  <span className={`dashboard-booking-status ${booking.status || 'pending'}`}>
                    {booking.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>Backend Status: Connected</p>
          <p>API Endpoint: {BACKEND_CONFIG.apiURL}</p>
          <p>Authentication: JWT Token System</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
