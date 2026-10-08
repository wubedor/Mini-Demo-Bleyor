import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyJobApplications.css';

export default function MyJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/job-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter applications for the current user
        const myApplications = response.data.data.applications.filter(
          app => app.applicantEmail === userData.email || app.email === userData.email
        );
        setApplications(myApplications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications');
    } finally {
      setLoading(false);
    }
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
    return <div className="my-applications-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="my-applications-page">
      <div className="applications-container">
        <div className="page-header">
          <h1>My Job Applications</h1>
          <p className="page-subtitle">View the status of your employment applications</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {applications.length === 0 ? (
          <div className="no-applications">
            <h2>No Applications Found</h2>
            <p>You haven't submitted any job applications yet.</p>
            <a href="/employees" className="apply-link">Apply Now</a>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="card-header">
                  <div className="position-info">
                    <h3>{app.position}</h3>
                    <p className="submitted-date">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="status-info">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Experience:</label>
                      <p>{app.experience}</p>
                    </div>
                    <div className="info-item">
                      <label>Education:</label>
                      <p>{app.education}</p>
                    </div>
                    <div className="info-item">
                      <label>Expected Salary:</label>
                      <p>{app.expectedSalary} GHS/month</p>
                    </div>
                    <div className="info-item">
                      <label>Availability:</label>
                      <p>{app.availability}</p>
                    </div>
                  </div>

                  {app.status !== 'pending' && (
                    <div className="admin-response-section">
                      <h4>Admin Response</h4>
                      <div className="response-details">
                        <div className="response-item">
                          <label>Status:</label>
                          <p className={`response-status ${app.status}`}>
                            {app.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                          </p>
                        </div>
                        <div className="response-item">
                          <label>Responded by:</label>
                          <p>{app.adminName || 'Admin'}</p>
                        </div>
                        <div className="response-item">
                          <label>Response Date:</label>
                          <p>{app.respondedAt ? new Date(app.respondedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="response-item full-width">
                          <label>Message:</label>
                          <p className="response-message">{app.adminResponse || 'No message provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="pending-message">
                      <p>⏳ Your application is currently under review. We will get back to you soon.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
