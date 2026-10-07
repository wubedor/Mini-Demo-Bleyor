import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import "./BookingForm.css";

export default function BookingForm({ selectedService }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service: selectedService || "",
    date: "",
    notes: "",
    deliveryOption: "both", // "pickup", "delivery", or "both"
    pickupLocation: null,
    deliveryLocation: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum date is tomorrow
    setMinDate(today.toISOString().split('T')[0]);
  }, []);

  // Update service when selectedService prop changes
  useEffect(() => {
    if (selectedService) {
      setForm(prev => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('cleaningOptions.')) {
      const optionName = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        cleaningOptions: {
          ...prev.cleaningOptions,
          [optionName]: checked
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!form.name || !form.phone || !form.address || !form.service || !form.date) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const bookingData = {
        customer: {
          name: form.name,
          phone: form.phone,
          email: user?.email || ''
        },
        service: form.service,
        address: form.address,
        date: form.date,
        notes: form.notes,
        deliveryOption: form.deliveryOption,
        pickupLocation: form.pickupLocation,
        deliveryLocation: form.deliveryLocation,
        userId: user?.id || 'guest',
        status: 'pending'
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess("Booking created successfully! We will contact you to confirm.");
        // Reset form
        setForm({
          name: "",
          phone: "",
          address: "",
          service: selectedService || "",
          date: "",
          notes: "",
          deliveryOption: "both",
          pickupLocation: null,
          deliveryLocation: null
        });
      } else {
        setError("Failed to create booking. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h2>Book Your Service</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+233 20 123 4567"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Your address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="service">Service Type *</label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={handleChange}
            required
          >
            <option value="">Select a service</option>
            <option value="Standard Laundry">Standard Laundry</option>
            <option value="Dry Cleaning">Dry Cleaning</option>
            <option value="Deep Cleaning">Deep Cleaning</option>
            <option value="Post-Construction Cleaning">Post-Construction Cleaning</option>
            <option value="Pre & Post Event Cleaning">Pre & Post Event Cleaning</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Preferred Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            min={minDate}
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryOption">Delivery Option</label>
          <select
            id="deliveryOption"
            name="deliveryOption"
            value={form.deliveryOption}
            onChange={handleChange}
          >
            <option value="pickup">Pickup Only</option>
            <option value="delivery">Delivery Only</option>
            <option value="both">Pickup and Delivery</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any special instructions..."
            rows={4}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Booking"}
        </button>
      </form>
    </div>
  );
}
