import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobApplicationsPage.css';

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/job-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setApplications(response.data.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (application) => {
    setSelectedApplication(application);
    setStatus(application.status);
    setResponse(application.adminResponse || '');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const apiResponse = await axios.put(`http://localhost:5000/api/job-applications/${selectedApplication._id}`, {
        status,
        adminResponse: response,
        adminName: `${userData.firstName} ${userData.lastName}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (apiResponse.data.success) {
        setSuccess(`Application ${status} successfully!`);
        setShowModal(false);
        fetchApplications();
      }
    } catch (err) {
      console.error('Error responding to application:', err);
      setError('Failed to respond to application');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setResponse('');
    setStatus('');
    setError('');
    setSuccess('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'accepted':
        return <span className="status-badge accepted">Accepted</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return <div className="job-applications-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="job-applications-page">
      <div className="applications-container">
        <div className="page-header">
          <h1>Job Applications</h1>
          <p className="page-subtitle">Review and respond to employment applications</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Experience</th>
                <th>Education</th>
                <th>Expected Salary</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="8">No applications found</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="applicant-info">
                        <strong>{app.applicantName}</strong>
                        <br />
                        <small>{app.applicantEmail}</small>
                        <br />
                        <small>{app.applicantPhone || 'No phone'}</small>
                      </div>
                    </td>
                    <td>{app.position}</td>
                    <td>{app.experience}</td>
                    <td>{app.education}</td>
                    <td>{app.expectedSalary} GHS</td>
                    <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      {app.status === 'pending' && (
                        <button 
                          className="respond-btn"
                          onClick={() => handleResponse(app)}
                        >
                          Respond
                        </button>
                      )}
                      {app.status !== 'pending' && (
                        <button 
                          className="view-btn"
                          onClick={() => handleResponse(app)}
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Application Details</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <div className="applicant-details">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <p>{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <p>{selectedApplication.phone || 'Not provided'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Address:</label>
                      <p>{selectedApplication.address || 'Not provided'}</p>
                    </div>
                    <div className="detail-item">
                      <label>City:</label>
                      <p>{selectedApplication.city || 'Not provided'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Region:</label>
                      <p>{selectedApplication.region || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Position Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Position:</label>
                      <p>{selectedApplication.position}</p>
                    </div>
                    <div className="detail-item">
                      <label>Experience:</label>
                      <p>{selectedApplication.experience}</p>
                    </div>
                    <div className="detail-item">
                      <label>Education:</label>
                      <p>{selectedApplication.education}</p>
                    </div>
                    <div className="detail-item">
                      <label>Skills:</label>
                      <p>{selectedApplication.skills}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Availability & Expectations</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Availability:</label>
                      <p>{selectedApplication.availability}</p>
                    </div>
                    <div className="detail-item">
                      <label>Expected Salary:</label>
                      <p>{selectedApplication.expectedSalary} GHS/month</p>
                    </div>
                    <div className="detail-item">
                      <label>Earliest Start Date:</label>
                      <p>{new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Cover Letter</h3>
                  <div className="cover-letter">
                    <p>{selectedApplication.coverLetter}</p>
                  </div>
                </div>

                {selectedApplication.status !== 'pending' && (
                  <div className="detail-section">
                    <h3>Admin Response</h3>
                    <div className="admin-response">
                      <p><strong>Status:</strong> {selectedApplication.status}</p>
                      <p><strong>Responded by:</strong> {selectedApplication.adminName || 'N/A'}</p>
                      <p><strong>Response:</strong> {selectedApplication.adminResponse || 'No response provided'}</p>
                      <p><strong>Responded at:</strong> {selectedApplication.respondedAt ? new Date(selectedApplication.respondedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                )}

                {selectedApplication.status === 'pending' && (
                  <form onSubmit={handleSubmitResponse} className="response-form">
                    <h3>Respond to Application</h3>
                    <div className="form-group">
                      <label>Action:</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="">Select action</option>
                        <option value="accepted">Accept Application</option>
                        <option value="rejected">Reject Application</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Response/Reason:</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        required
                        placeholder="Provide a reason for your decision..."
                        rows={4}
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        Submit Response
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
