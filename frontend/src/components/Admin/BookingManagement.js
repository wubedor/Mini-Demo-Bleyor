import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../../config/backendConfig';
import './BookingManagement.css';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [currentPage, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date: dateFilter || undefined
      };

      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/bookings`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data.bookings || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings(); // Refresh data
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BACKEND_CONFIG.apiURL}/admin/bookings/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings(); // Refresh data
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError('Failed to delete booking');
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusChange = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowStatusModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      picked_up: '#6f42c1',
      in_progress: '#fd7e14',
      ready_for_delivery: '#20c997',
      out_for_delivery: '#6610f2',
      delivered: '#28a745',
      cancelled: '#dc3545',
      completed: '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const filteredBookings = bookings.filter(booking => {
    const searchMatch = 
      (booking.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getServiceName(booking.service) || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    
    const dateMatch = !dateFilter || 
      new Date(booking.scheduledDate).toDateString() === new Date(dateFilter).toDateString();
    
    return searchMatch && statusMatch && dateMatch;
  });

  const renderBookingModal = () => {
    if (!showModal || !selectedBooking) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Booking Details</h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="booking-details">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedBooking.user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedBooking.user?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedBooking.user?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service:</label>
                    <span>{getServiceName(selectedBooking.service)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Booking Type:</label>
                    <span>{selectedBooking.bookingType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quantity:</label>
                    <span>{selectedBooking.quantity || 1}</span>
                  </div>
                  <div className="detail-item">
                    <label>Base Price:</label>
                    <span>${selectedBooking.basePrice || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Price:</label>
                    <span>${selectedBooking.totalPrice || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Method:</label>
                    <span>{selectedBooking.paymentMethod || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Scheduling</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Scheduled Date:</label>
                    <span>{selectedBooking.scheduledDate ? new Date(selectedBooking.scheduledDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Scheduled Time:</label>
                    <span>{selectedBooking.scheduledTime || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created At:</label>
                    <span>{selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Status & Tracking</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Tracking Number:</label>
                    <span>{selectedBooking.trackingNumber || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.pickupAddress && (
                <div className="detail-section">
                  <h3>Pickup Address</h3>
                  <div className="address-details">
                    <p>{selectedBooking.pickupAddress.street}</p>
                    <p>{selectedBooking.pickupAddress.city}, {selectedBooking.pickupAddress.state} {selectedBooking.pickupAddress.zipCode}</p>
                  </div>
                </div>
              )}

              {selectedBooking.deliveryAddress && (
                <div className="detail-section">
                  <h3>Delivery Address</h3>
                  <div className="address-details">
                    <p>{selectedBooking.deliveryAddress.street}</p>
                    <p>{selectedBooking.deliveryAddress.city}, {selectedBooking.deliveryAddress.state} {selectedBooking.deliveryAddress.zipCode}</p>
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowModal(false);
                handleStatusChange(selectedBooking);
              }}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusModal = () => {
    if (!showStatusModal || !selectedBooking) return null;

    const statuses = ['pending', 'confirmed', 'picked_up', 'in_progress', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'completed'];

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Update Booking Status</h2>
            <button className="close-btn" onClick={() => setShowStatusModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="status-update-form">
              <div className="detail-item">
                <label>Current Status:</label>
                <span className={`status-badge ${selectedBooking.status}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="form-group">
                <label>New Status:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleStatusUpdate(selectedBooking._id, newStatus)}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="booking-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-management">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchBookings} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-management">
      <div className="page-header">
        <h1>Booking Management</h1>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-outline"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="controls-section">
        <div className="search-filter">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_progress">In Progress</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="date-filter">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i>
            New Booking
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>

      <div className="bookings-table-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <i className="fas fa-calendar-times"></i>
            <h3>No bookings found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id}>
                  <td>
                    <div className="booking-id">
                      <span>#{booking._id.slice(-8)}</span>
                      {booking.trackingNumber && (
                        <small>Track: {booking.trackingNumber}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <h4>{booking.user?.fullName || 'N/A'}</h4>
                      <p>{booking.user?.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="service-info">
                      <span>{getServiceName(booking.service)}</span>
                      <small>{booking.bookingType}</small>
                    </div>
                  </td>
                  <td>
                    <div className="schedule-info">
                      <span>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}</span>
                      <small>{booking.scheduledTime || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.status), color: 'white' }}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="price-info">
                      <span>${booking.totalPrice || 0}</span>
                      <small>{booking.paymentMethod}</small>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewBooking(booking)}
                        className="btn btn-sm btn-outline"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking)}
                        className="btn btn-sm btn-primary"
                        title="Update Status"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/bookings/${booking._id}/edit`)}
                        className="btn btn-sm btn-outline"
                        title="Edit Booking"
                      >
                        <i className="fas fa-cog"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Booking"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {renderBookingModal()}
      {renderStatusModal()}
    </div>
  );
}
