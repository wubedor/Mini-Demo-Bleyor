import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';

const AdminEmploymentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState({ status: '', position: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'status', 'interview', 'notes'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, [filter, pagination.page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filter
      };

      const response = await axios.get(
        `${BACKEND_CONFIG.apiURL}/employment/applications`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setApplications(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BACKEND_CONFIG.apiURL}/employment/statistics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BACKEND_CONFIG.apiURL}/employment/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedApplication(response.data.data);
      setShowModal(true);
      setModalType('view');
    } catch (error) {
      console.error('Error fetching application:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/employment/applications/${selectedApplication._id}/status`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchApplications();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/employment/applications/${selectedApplication._id}/interview`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchApplications();
      fetchStatistics();
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_CONFIG.apiURL}/employment/applications/${selectedApplication._id}/notes`,
        { note: formData.note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchApplications();
      handleViewApplication(selectedApplication._id);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BACKEND_CONFIG.apiURL}/employment/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const openModal = (type, application = null) => {
    setSelectedApplication(application);
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setFormData({});
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      under_review: '#17a2b8',
      interview_scheduled: '#007bff',
      interview_completed: '#6c757d',
      offered: '#28a745',
      accepted: '#28a745',
      rejected: '#dc3545',
      withdrawn: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && applications.length === 0) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="admin-employment-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Employment Applications</h1>
          <button className="btn-refresh" onClick={() => { fetchApplications(); fetchStatistics(); }}>
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="statistics-grid">
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p className="stat-number">{statistics.byStatus.total}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-number">{statistics.byStatus.pending}</p>
            </div>
            <div className="stat-card">
              <h3>Under Review</h3>
              <p className="stat-number">{statistics.byStatus.under_review}</p>
            </div>
            <div className="stat-card">
              <h3>Interview Scheduled</h3>
              <p className="stat-number">{statistics.byStatus.interview_scheduled}</p>
            </div>
            <div className="stat-card">
              <h3>This Month</h3>
              <p className="stat-number">{statistics.thisMonthApplications}</p>
            </div>
            <div className="stat-card">
              <h3>Last 7 Days</h3>
              <p className="stat-number">{statistics.recentApplications}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interview_completed">Interview Completed</option>
              <option value="offered">Offered</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Position:</label>
            <select
              name="position"
              value={filter.position}
              onChange={handleFilterChange}
            >
              <option value="">All Positions</option>
              <option value="driver">Driver</option>
              <option value="laundry_staff">Laundry Staff</option>
              <option value="customer_service">Customer Service</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search by name, email, or phone..."
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application._id}>
                  <td>{application.firstName} {application.lastName}</td>
                  <td>{application.email}</td>
                  <td>{application.phone}</td>
                  <td>{application.positionApplied}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {application.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewApplication(application._id)}
                      >
                        View
                      </button>
                      <button
                        className="btn-status"
                        onClick={() => openModal('status', application)}
                      >
                        Update Status
                      </button>
                      <button
                        className="btn-interview"
                        onClick={() => openModal('interview', application)}
                      >
                        Schedule Interview
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteApplication(application._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {applications.length === 0 && (
            <div className="no-applications">
              <p>No applications found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'view' ? 'Application Details' :
                 modalType === 'status' ? 'Update Status' :
                 modalType === 'interview' ? 'Schedule Interview' :
                 modalType === 'notes' ? 'Add Note' : ''}
              </h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {modalType === 'view' && (
                <div className="application-details">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <p><strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                    <p><strong>Email:</strong> {selectedApplication.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                    <p><strong>Date of Birth:</strong> {formatDate(selectedApplication.dateOfBirth)}</p>
                    <p><strong>Gender:</strong> {selectedApplication.gender}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Address</h3>
                    <p>{selectedApplication.address.street}</p>
                    <p>{selectedApplication.address.city}, {selectedApplication.address.state}</p>
                    <p>{selectedApplication.address.zipCode}, {selectedApplication.address.country}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Position Information</h3>
                    <p><strong>Position:</strong> {selectedApplication.positionApplied}</p>
                    <p><strong>Expected Salary:</strong> ₦{selectedApplication.expectedSalary}</p>
                    <p><strong>Available Start Date:</strong> {formatDate(selectedApplication.availableStartDate)}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Education</h3>
                    {selectedApplication.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <p><strong>{edu.degree}</strong> in {edu.fieldOfStudy}</p>
                        <p>{edu.institution}</p>
                        <p>{formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="detail-section">
                    <h3>Work Experience</h3>
                    {selectedApplication.workExperience.map((work, index) => (
                      <div key={index} className="work-item">
                        <p><strong>{work.position}</strong> at {work.company}</p>
                        <p>{formatDate(work.startDate)} - {work.isCurrentlyWorking ? 'Present' : formatDate(work.endDate)}</p>
                        <p>{work.responsibilities}</p>
                      </div>
                    ))}
                  </div>

                  <div className="detail-section">
                    <h3>Skills</h3>
                    <div className="skills-list">
                      {selectedApplication.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>References</h3>
                    {selectedApplication.references.map((ref, index) => (
                      <div key={index} className="reference-item">
                        <p><strong>{ref.name}</strong> - {ref.position} at {ref.company}</p>
                        <p>Phone: {ref.phone} | Email: {ref.email}</p>
                        <p>Relationship: {ref.relationship}</p>
                      </div>
                    ))}
                  </div>

                  <div className="detail-section">
                    <h3>Cover Letter</h3>
                    <p>{selectedApplication.coverLetter}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Why Join Us</h3>
                    <p>{selectedApplication.whyJoinUs}</p>
                  </div>

                  {selectedApplication.interviewSchedule && (
                    <div className="detail-section">
                      <h3>Interview Schedule</h3>
                      <p><strong>Date:</strong> {formatDate(selectedApplication.interviewSchedule.date)}</p>
                      <p><strong>Time:</strong> {selectedApplication.interviewSchedule.time}</p>
                      <p><strong>Location:</strong> {selectedApplication.interviewSchedule.location}</p>
                      <p><strong>Type:</strong> {selectedApplication.interviewSchedule.type}</p>
                    </div>
                  )}

                  {selectedApplication.adminNotes && selectedApplication.adminNotes.length > 0 && (
                    <div className="detail-section">
                      <h3>Admin Notes</h3>
                      {selectedApplication.adminNotes.map((note, index) => (
                        <div key={index} className="note-item">
                          <p><strong>{note.addedBy?.firstName} {note.addedBy?.lastName}</strong></p>
                          <p>{formatDate(note.timestamp)}</p>
                          <p>{note.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button className="btn-add-note" onClick={() => setModalType('notes')}>
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'status' && (
                <div className="status-form">
                  <div className="form-group">
                    <label>New Status:</label>
                    <select
                      value={formData.status || selectedApplication.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="interview_completed">Interview Completed</option>
                      <option value="offered">Offered</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes (optional):</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-submit" onClick={handleStatusUpdate}>
                      Update Status
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'interview' && (
                <div className="interview-form">
                  <div className="form-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time:</label>
                    <input
                      type="time"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type:</label>
                    <select
                      value={formData.type || 'in_person'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="in_person">In Person</option>
                      <option value="video_call">Video Call</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes (optional):</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-submit" onClick={handleScheduleInterview}>
                      Schedule Interview
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'notes' && (
                <div className="notes-form">
                  <div className="form-group">
                    <label>Note:</label>
                    <textarea
                      value={formData.note || ''}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows="4"
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-submit" onClick={handleAddNote}>
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-employment-dashboard {
          padding: 2rem 0;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          color: #333;
          margin: 0;
        }

        .btn-refresh {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-card h3 {
          color: #666;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }

        .filters-bar {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 200px;
        }

        .filter-group label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .applications-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
        }

        .applications-table thead {
          background: #007bff;
          color: white;
        }

        .applications-table th,
        .applications-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .applications-table tbody tr:hover {
          background: #f9f9f9;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-buttons button {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .btn-view {
          background: #007bff;
          color: white;
        }

        .btn-status {
          background: #28a745;
          color: white;
        }

        .btn-interview {
          background: #ffc107;
          color: #333;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .no-applications {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .pagination button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .application-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-section {
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 4px;
        }

        .detail-section h3 {
          color: #007bff;
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .detail-section p {
          margin: 0.5rem 0;
          color: #333;
        }

        .education-item,
        .work-item,
        .reference-item,
        .note-item {
          padding: 0.75rem;
          background: white;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: #007bff;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
            gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-submit,
        .btn-add-note {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default AdminEmploymentDashboard;
