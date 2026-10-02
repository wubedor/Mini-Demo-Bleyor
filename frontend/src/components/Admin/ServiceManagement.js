import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../../config/backendConfig';
import './ServiceManagement.css';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'laundry',
    basePrice: 0,
    pricingType: 'per_item',
    duration: 60,
    turnaroundTime: 24,
    isActive: true,
    isAvailable: true,
    availableAreas: []
  });
  const navigate = useNavigate();

  const categories = [
    'laundry',
    'dry_cleaning',
    'ironing',
    'stain_removal',
    'alterations',
    'house_cleaning',
    'office_cleaning',
    'carpet_cleaning',
    'other'
  ];

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchServices = async () => {
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
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
      };

      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/services`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setServices(response.data.services || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_CONFIG.apiURL}/admin/services`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices(); // Refresh data
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Failed to create service');
    }
  };

  const handleUpdateService = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/services/${selectedService._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices(); // Refresh data
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BACKEND_CONFIG.apiURL}/admin/services/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices(); // Refresh data
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service');
    }
  };

  const handleToggleStatus = async (serviceId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/services/${serviceId}/toggle-status`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices(); // Refresh data
    } catch (error) {
      console.error('Error toggling service status:', error);
      setError('Failed to update service status');
    }
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      basePrice: service.basePrice,
      pricingType: service.pricingType,
      duration: service.duration,
      turnaroundTime: service.turnaroundTime,
      isActive: service.isActive,
      isAvailable: service.isAvailable,
      availableAreas: service.availableAreas || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'laundry',
      basePrice: 0,
      pricingType: 'per_item',
      duration: 60,
      turnaroundTime: 24,
      isActive: true,
      isAvailable: true,
      availableAreas: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const filteredServices = services.filter(service => {
    const searchMatch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryMatch = categoryFilter === 'all' || service.category === categoryFilter;
    
    const statusMatch = statusFilter === 'all' || 
                      (statusFilter === 'active' && service.isActive) ||
                      (statusFilter === 'inactive' && !service.isActive);
    
    return searchMatch && categoryMatch && statusMatch;
  });

  const renderServiceModal = () => {
    if (!showModal || !selectedService) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Service Details</h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="service-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedService.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pricing Type:</label>
                    <span>{selectedService.pricingType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Base Price:</label>
                    <span>${selectedService.basePrice}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedService.description}</p>
              </div>

              <div className="detail-section">
                <h3>Service Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Duration:</label>
                    <span>{selectedService.duration} minutes</span>
                  </div>
                  <div className="detail-item">
                    <label>Turnaround Time:</label>
                    <span>{selectedService.turnaroundTime} hours</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedService.isActive ? 'active' : 'inactive'}`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Available:</label>
                    <span className={`status-badge ${selectedService.isAvailable ? 'available' : 'unavailable'}`}>
                      {selectedService.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Statistics</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Order Count:</label>
                    <span>{selectedService.orderCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Average Rating:</label>
                    <span>{selectedService.averageRating || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Popularity Score:</label>
                    <span>{selectedService.popularityScore || 0}</span>
                  </div>
                </div>
              </div>
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
                handleEditService(selectedService);
              }}
            >
              Edit Service
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{selectedService ? 'Edit Service' : 'Create New Service'}</h2>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <form className="service-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Base Price ($) *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Pricing Type *</label>
                  <select
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="per_item">Per Item</option>
                    <option value="per_kg">Per KG</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_sqft">Per Sq Ft</option>
                    <option value="fixed">Fixed Price</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Turnaround Time (hours) *</label>
                  <input
                    type="number"
                    name="turnaroundTime"
                    value={formData.turnaroundTime}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="form-control"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                    Available
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-success"
              onClick={selectedService ? handleUpdateService : handleCreateService}
            >
              {selectedService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="service-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-management">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchServices} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-management">
      <div className="page-header">
        <h1>Service Management</h1>
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="actions">
          <button 
            onClick={() => {
              setSelectedService(null);
              resetForm();
              setShowEditModal(true);
            }}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Add Service
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>

      <div className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="no-services">
            <i className="fas fa-concierge-bell"></i>
            <h3>No services found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <div className="service-badges">
                  <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`status-badge ${service.isAvailable ? 'available' : 'unavailable'}`}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="service-category">
                <span className="category-badge">{service.category}</span>
              </div>

              <div className="service-description">
                <p>{service.description}</p>
              </div>

              <div className="service-details">
                <div className="detail-item">
                  <i className="fas fa-tag"></i>
                  <span>${service.basePrice}</span>
                  <small>{service.pricingType}</small>
                </div>
                <div className="detail-item">
                  <i className="fas fa-clock"></i>
                  <span>{service.duration} min</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-hourglass-half"></i>
                  <span>{service.turnaroundTime}h</span>
                </div>
              </div>

              <div className="service-stats">
                <div className="stat-item">
                  <span className="stat-value">{service.orderCount || 0}</span>
                  <small>Orders</small>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{service.averageRating || 'N/A'}</span>
                  <small>Rating</small>
                </div>
              </div>

              <div className="service-actions">
                <button 
                  onClick={() => handleViewService(service)}
                  className="btn btn-sm btn-outline"
                  title="View Details"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  onClick={() => handleEditService(service)}
                  className="btn btn-sm btn-outline"
                  title="Edit Service"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  onClick={() => handleToggleStatus(service._id, service.isActive)}
                  className={`btn btn-sm ${service.isActive ? 'btn-warning' : 'btn-success'}`}
                  title={service.isActive ? 'Deactivate' : 'Activate'}
                >
                  <i className={`fas ${service.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                </button>
                <button 
                  onClick={() => handleDeleteService(service._id)}
                  className="btn btn-sm btn-danger"
                  title="Delete Service"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
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

      {renderServiceModal()}
      {renderEditModal()}
    </div>
  );
}
