import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BookingForm from './BookingForm';
import './BookingPage.css';

export default function BookingPage() {
  const location = useLocation();
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    // Get the service name passed from About page or Services component
    const serviceFromState = location.state?.service || location.state?.serviceName || '';
    setSelectedService(serviceFromState);
  }, [location.state]);

  return (
    <div className="booking-page-container">
      <h1>Book a Service</h1>
      {selectedService && (
        <p className="selected-service-info">
          Selected Service: <strong>{selectedService}</strong>
        </p>
      )}
      <BookingForm selectedService={selectedService} />
    </div>
  );
}