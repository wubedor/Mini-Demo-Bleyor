import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Admin/Dashboard';
import UserManagement from '../components/Admin/UserManagement';
import BookingManagement from '../components/Admin/BookingManagement';
import ServiceManagement from '../components/Admin/ServiceManagement';
import AdminEmploymentDashboard from '../components/AdminEmploymentDashboard';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/bookings" element={<BookingManagement />} />
      <Route path="/admin/services" element={<ServiceManagement />} />
      <Route path="/admin/employment" element={<AdminEmploymentDashboard />} />
    </Routes>
  );
}

export default AdminRoutes;
