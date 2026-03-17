import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./LocationMap.css";

const DEFAULT_LOCATION = {
  lat: 5.6037,
  lng: -0.1870,
  title: "Bleyor's Laundry and Cleaning Services, Accra",
};

export default function LocationMap({ location = DEFAULT_LOCATION }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const isValidApiKey = apiKey && !/^(YOUR_API_KEY_HERE|YOUR_GOOGLE_MAPS_API_KEY)$/.test(apiKey.trim());

    if (!isValidApiKey) {
      setError("Google Maps API key not configured. Please add a valid key to the .env file.");
      return;
    }

    const initializeMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        console.log("Google Maps not yet loaded or map ref not ready");
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 16,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        });

        const marker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: location.title,
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="info-window">
              <strong>${location.title}</strong><br/>
              Pickup & Delivery Location<br/>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        infoWindow.open(map, marker);
        setMapLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map: " + err.message);
      }
    };

    // Load Google Maps script dynamically
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      
      // Define global callback
      window.initGoogleMaps = () => {
        console.log('Google Maps loaded successfully');
        initializeMap();
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setError('Failed to load Google Maps. Please check your internet connection and API key configuration.');
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [location]);

  return (
    <div className="location-map-container">
      <h3>📍 Pickup Location</h3>
      {error && <div className="map-error">{error}</div>}
      <div
        ref={mapRef}
        className={`location-map ${mapLoaded ? "loaded" : ""}`}
      />
    </div>
  );
}

LocationMap.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    title: PropTypes.string,
  }),
};
