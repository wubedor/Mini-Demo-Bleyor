import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_CONFIG } from "../config/backendConfig";
import "./BookingForm.css";

export default function BackendBookingForm({ selectedService }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", state: "", zipCode: "", service: selectedService || "",
    date: "", notes: "", deliveryOption: "pickup"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    document.getElementById('booking-date')?.setAttribute('min', minDate);

    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Fetch user data
          const userResponse = await axios.get(`${BACKEND_CONFIG.apiURL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = userResponse.data.data.user;
          setForm(prev => ({
            ...prev,
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone || prev.phone,
            address: userData.addresses?.[0]?.street || prev.address,
            city: userData.addresses?.[0]?.city || prev.city,
            state: userData.addresses?.[0]?.state || prev.state,
            zipCode: userData.addresses?.[0]?.zipCode || prev.zipCode,
          }));

          // Fetch available services
          const servicesResponse = await axios.get(`${BACKEND_CONFIG.apiURL}/services`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const servicesData = servicesResponse.data.data.services || [];
          setServices(servicesData);

          // Resolve a display name or backend ID to the service option value.
          if (selectedService) {
            const selectedServiceObj = servicesData.find(
              service => service._id === selectedService || service.name === selectedService
            );
            if (selectedServiceObj) {
              setForm(prev => ({ ...prev, service: selectedServiceObj._id }));
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [selectedService]);

  const handleChange = (key) => (e) => {
    let value = e.target.value;
    if (key === "phone") {
      const input = value.replace(/\D/g, "").substring(0, 10);
      const size = input.length;
      if (size <= 3) value = input;
      else if (size <= 6) value = `(${input.substring(0, 3)}) ${input.substring(3)}`;
      else value = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6, 10)}`;
    }
    setForm({ ...form, [key]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.zipCode || !form.service || !form.date) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Please login to book a service.");
        navigate('/login');
        return;
      }
      const bookingData = {
        service: form.service,
        bookingType: form.deliveryOption,
        quantity: 1,
        scheduledDate: form.date,
        scheduledTime: "09:00",
        paymentMethod: "cash",
        pickupAddress: {
          street: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode
        },
        deliveryAddress: {
          street: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode
        },
        specialInstructions: form.notes
      };
      await axios.post(`${BACKEND_CONFIG.apiURL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Error submitting booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={submit}>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Booking successful! Redirecting...</div>}
      
      <input type="text" placeholder="Name" value={form.name} onChange={handleChange("name")} className="input" required />
      <input type="tel" placeholder="Phone" value={form.phone} onChange={handleChange("phone")} className="input" required />
      <input type="text" placeholder="Street address" value={form.address} onChange={handleChange("address")} className="input" required />
      <input type="text" placeholder="City" value={form.city} onChange={handleChange("city")} className="input" required />
      <input type="text" placeholder="State / Region" value={form.state} onChange={handleChange("state")} className="input" required />
      <input type="text" placeholder="Postal code" value={form.zipCode} onChange={handleChange("zipCode")} className="input" required />
      
      <select value={form.service} onChange={handleChange("service")} className="input" required>
        <option value="">Select Service</option>
        {services.map((s, i) => <option key={i} value={s._id}>{s.name}</option>)}
      </select>
      
      <input id="booking-date" type="date" value={form.date} onChange={handleChange("date")} className="input" required />
      <textarea placeholder="Notes" value={form.notes} onChange={handleChange("notes")} className="textarea" />
      
      <button type="submit" className="button booking-form-button" disabled={loading}>
        {loading ? "Submitting..." : "Submit Booking"}
      </button>
    </form>
  );
}
