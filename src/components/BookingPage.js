import React from 'react';
import { useLocation } from 'react-router-dom';
import BookingForm from './BookingForm';
import './BookingPage.css';

export default function BookingPage() {
  const location = useLocation();
  // Get the service name passed from the Services component
  const selectedService = location.state?.serviceName || "";

  return (
    <div className="booking-page-container">
      <h1>Book a Service</h1>
      <BookingForm selectedService={selectedService} />
    </div>
  );
}