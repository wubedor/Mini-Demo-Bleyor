import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "./LocationPicker";
import "./BookingForm.css";
import "./LocationPicker.css";

export default function BookingForm({ selectedService }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service: "",
    date: "",
    notes: "",
    deliveryOption: "both", // New field: "pickup", "delivery", or "both"
    pickupLocation: null, // New field for pickup coordinates
    deliveryLocation: null, // New field for delivery coordinates
    cleaningOptions: {
      sweepingMopping: false,
      dusting: false,
      washrooms: false,
      corridors: false,
      wasteDisposal: false,
      scrubbingFloors: false,
      wallsTilesWashing: false,
      windowsGlassCleaning: false,
      furnitureCleaning: false,
      washroomDescaling: false,
      removingPaintMarks: false,
      highIntensityDebrisRemoval: false,
      venuePreparationRestoration: false,
      washingDryingIroning: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000); // Disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (selectedService) {
      setForm((prevForm) => ({
        ...prevForm,
        service: selectedService,
      }));
    }
  }, [selectedService]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMinDate(`${year}-${month}-${day}`);

    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setForm((prevForm) => ({
            ...prevForm,
            name: userData.name || prevForm.name,
            phone: userData.phonenumber || prevForm.phone,
            address: userData.address || prevForm.address,
          }));
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleChange = (key) => (e) => {
    let value = e.target.value;

    if (key === "phone") {
      // Remove non-digit characters and limit to 10 digits
      const input = value.replace(/\D/g, "").substring(0, 10);
      const size = input.length;

      // Apply formatting as (XXX) XXX-XXXX
      if (size <= 3) {
        value = input;
      } else if (size <= 6) {
        value = `(${input.substring(0, 3)}) ${input.substring(3)}`;
      } else {
        value = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6, 10)}`;
      }
    }

    setForm({ ...form, [key]: value });
  };

  const handlePickupLocationSelect = (location) => {
    setForm(prevForm => ({
      ...prevForm,
      pickupLocation: location
    }));
    setShowPickupPicker(false);
  };

  const handleDeliveryLocationSelect = (location) => {
    setForm(prevForm => ({
      ...prevForm,
      deliveryLocation: location,
      address: location.address // Update address field with selected location
    }));
    setShowDeliveryPicker(false);
  };

  const handleCleaningOptionChange = (option) => (e) => {
    setForm(prevForm => ({
      ...prevForm,
      cleaningOptions: {
        ...prevForm.cleaningOptions,
        [option]: e.target.checked
      }
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate required fields based on delivery option
    const needsAddress = form.deliveryOption === 'delivery' || form.deliveryOption === 'both';
    const needsPickupLocation = form.deliveryOption === 'pickup' || form.deliveryOption === 'both';
    
    if (!form.name || !form.phone || !form.service || !form.date) {
      setError("Please fill out all required fields.");
      return;
    }
    
    if (needsAddress && !form.address && !form.deliveryLocation) {
      setError("Please select a delivery location.");
      return;
    }
    
    if (needsPickupLocation && !form.pickupLocation) {
      setError("Please select a pickup location.");
      return;
    }

    // Validate date is not in the past
    if (form.date < minDate) {
      setError("Booking date cannot be in the past.");
      return;
    }

    // Validate phone number after removing formatting
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, "bookings"), {
        ...form,
        userId: user ? user.uid : null,
        createdAt: new Date(),
        status: "Pending",
      });
      setSuccess(true);
      // Reset booking-specific fields. This preserves pre-filled user data
      // for logged-in users and is a convenience for guests who might want
      // to book again.
      setForm((prevForm) => ({
        ...prevForm,
        date: "",
        notes: "",
        service: "", // Clear service field for a new booking
        // Keep deliveryOption, name, phone, address for convenience
        cleaningOptions: {
          sweepingMopping: false,
          dusting: false,
          washrooms: false,
          corridors: false,
          wasteDisposal: false,
          scrubbingFloors: false,
          wallsTilesWashing: false,
          windowsGlassCleaning: false,
          furnitureCleaning: false,
          washroomDescaling: false,
          removingPaintMarks: false,
          highIntensityDebrisRemoval: false,
          venuePreparationRestoration: false,
          washingDryingIroning: false
        }
      }));
    } catch (err) {
      setError("Error submitting booking: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="booking-form" className="booking-form" onSubmit={submit}>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Your booking has been submitted successfully!
        </div>
      )}

      {/* Delivery Options */}
      <div className="delivery-options">
        <label className="delivery-options-label">Service Type:</label>
        <div className="delivery-option-buttons">
          <button
            type="button"
            className={`delivery-option-button ${form.deliveryOption === 'pickup' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, deliveryOption: 'pickup' })}
          >
            🚚 Pickup Only
          </button>
          <button
            type="button"
            className={`delivery-option-button ${form.deliveryOption === 'delivery' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, deliveryOption: 'delivery' })}
          >
            🏠 Delivery Only
          </button>
          <button
            type="button"
            className={`delivery-option-button ${form.deliveryOption === 'both' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, deliveryOption: 'both' })}
          >
            🔄 Pickup & Delivery
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={handleChange("name")}
        className="input"
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange("phone")}
        className="input"
        required
      />
      
      {/* Address field - only show if delivery is involved */}
      {(form.deliveryOption === 'delivery' || form.deliveryOption === 'both') && (
        <div className="location-input-group">
          <div className="location-input-container">
            <input
              type="text"
              placeholder="Delivery Address"
              value={form.deliveryLocation ? form.deliveryLocation.address : form.address}
              onChange={handleChange("address")}
              className="input"
              readOnly={!!form.deliveryLocation}
            />
            <button
              type="button"
              className="location-picker-button"
              onClick={() => setShowDeliveryPicker(true)}
            >
              📍 Select on Map
            </button>
          </div>
          {form.deliveryLocation && (
            <div className="selected-location-info">
              <small>✅ Location selected: {form.deliveryLocation.address}</small>
            </div>
          )}
        </div>
      )}
      {form.deliveryOption === 'pickup' && (
        <div className="location-input-group">
          <div className="location-input-container">
            <input
              type="text"
              placeholder="Pickup Location"
              value={form.pickupLocation ? form.pickupLocation.address : ''}
              className="input"
              readOnly
            />
            <button
              type="button"
              className="location-picker-button"
              onClick={() => setShowPickupPicker(true)}
            >
              📍 Select on Map
            </button>
          </div>
          {form.pickupLocation && (
            <div className="selected-location-info">
              <small>✅ Pickup location selected: {form.pickupLocation.address}</small>
            </div>
          )}
        </div>
      )}
      
      <input
        type="text"
        placeholder="Service"
        value={form.service}
        onChange={handleChange("service")}
        className="input"
        required
      />
      
      {/* Debug: Show current service value */}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
        Debug: Current service = "{form.service}"
      </div>
      
      {/* Cleaning Options - only show for Standard/Routine Cleaning */}
      {form.service && form.service.includes("Standard") && (
        <div className="cleaning-options-section">
          <h4>Select Cleaning Services:</h4>
          <div className="cleaning-options-grid">
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.sweepingMopping}
                onChange={handleCleaningOptionChange('sweepingMopping')}
              />
              <span>Sweeping & mopping</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.dusting}
                onChange={handleCleaningOptionChange('dusting')}
              />
              <span>Dusting</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.washrooms}
                onChange={handleCleaningOptionChange('washrooms')}
              />
              <span>Washrooms cleaning</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.corridors}
                onChange={handleCleaningOptionChange('corridors')}
              />
              <span>Corridors/staircase</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.wasteDisposal}
                onChange={handleCleaningOptionChange('wasteDisposal')}
              />
              <span>Light waste disposal</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Deep Cleaning Options - only show for Deep Cleaning */}
      {form.service && form.service.includes("Deep") && (
        <div className="cleaning-options-section">
          <h4>Select Deep Cleaning Services:</h4>
          <div className="cleaning-options-grid">
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.scrubbingFloors}
                onChange={handleCleaningOptionChange('scrubbingFloors')}
              />
              <span>Scrubbing floors</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.wallsTilesWashing}
                onChange={handleCleaningOptionChange('wallsTilesWashing')}
              />
              <span>Walls/tiles washing</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.windowsGlassCleaning}
                onChange={handleCleaningOptionChange('windowsGlassCleaning')}
              />
              <span>Windows/glass cleaning</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.furnitureCleaning}
                onChange={handleCleaningOptionChange('furnitureCleaning')}
              />
              <span>Furniture cleaning</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.washroomDescaling}
                onChange={handleCleaningOptionChange('washroomDescaling')}
              />
              <span>Washroom descaling</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Post-Construction Cleaning Options - only show for Post-Construction Cleaning */}
      {form.service && form.service.includes("Post-Construction") && (
        <div className="cleaning-options-section">
          <h4>Select Post-Construction Cleaning Services:</h4>
          <div className="cleaning-options-grid">
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.removingPaintMarks}
                onChange={handleCleaningOptionChange('removingPaintMarks')}
              />
              <span>Removing paint marks, cement dust</span>
            </label>
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.highIntensityDebrisRemoval}
                onChange={handleCleaningOptionChange('highIntensityDebrisRemoval')}
              />
              <span>High-intensity debris removal</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Pre & Post Event Cleaning Options - only show for Pre & Post Event Cleaning */}
      {form.service && (form.service.includes("Event") || form.service.includes("Pre & Post")) && (
        <div className="cleaning-options-section">
          <h4>Select Event Cleaning Services:</h4>
          <div className="cleaning-options-grid">
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.venuePreparationRestoration}
                onChange={handleCleaningOptionChange('venuePreparationRestoration')}
              />
              <span>Venue preparation and restoration</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Laundry Services Options - only show for Laundry Services */}
      {form.service && form.service.includes("Laundry") && (
        <div className="cleaning-options-section">
          <h4>Select Laundry Services:</h4>
          <div className="cleaning-options-grid">
            <label className="cleaning-option">
              <input
                type="checkbox"
                checked={form.cleaningOptions.washingDryingIroning}
                onChange={handleCleaningOptionChange('washingDryingIroning')}
              />
              <span>Washing, drying, ironing</span>
            </label>
          </div>
        </div>
      )}
      
      <input
        type="date"
        placeholder="Date"
        value={form.date}
        onChange={handleChange("date")}
        className="input"
        min={minDate}
        required
      />
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange("notes")}
        className="textarea"
      />
      <button
        type="submit"
        className="button booking-form-button"
        disabled={loading}
      >
        {loading && <div className="spinner"></div>}
        {loading ? "Submitting..." : "Submit Booking"}
      </button>
      
      {/* Location Pickers */}
      <LocationPicker
        isOpen={showPickupPicker}
        onClose={() => setShowPickupPicker(false)}
        onLocationSelect={handlePickupLocationSelect}
        initialLocation={form.pickupLocation}
      />
      
      <LocationPicker
        isOpen={showDeliveryPicker}
        onClose={() => setShowDeliveryPicker(false)}
        onLocationSelect={handleDeliveryLocationSelect}
        initialLocation={form.deliveryLocation}
      />
    </form>
  );
}
