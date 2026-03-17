import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        // Order by createdAt descending to show newest first
        const q = query(bookingsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, { status: newStatus });
      setBookings(bookings.map(b => 
        b.id === id ? { ...b, status: newStatus } : b
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filter === 'All' || (booking.status || 'Pending') === filter;
    const searchMatch = booking.name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  if (loading) return <div className="admin-dashboard"><LoadingSpinner /></div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-controls">
        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dashboard-filter">
          <label>Filter by Status: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bookings-table-container">
        {filteredBookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.date}</td>
                  <td>{booking.name}</td>
                  <td>{booking.service}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.address}</td>
                  <td>{booking.notes}</td>
                  <td>
                    <span className={`status-badge ${booking.status?.toLowerCase() || 'pending'}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {booking.status !== 'Completed' && (
                      <button 
                        className="action-btn complete-btn"
                        onClick={() => updateStatus(booking.id, 'Completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}