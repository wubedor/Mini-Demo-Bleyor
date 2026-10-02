import React, { useState, useCallback, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Prevent multiple Google Maps API loads
let googleMapsLoaded = false;

// Global reference to store the props
let mapComponentProps = null;

function MapComponent({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);

    // Set initial location
    const initialPos = initialLocation || {
      lat: 40.7128, // Default to New York
      lng: -74.0060
    };

    // Create initial marker
    const marker = new window.google.maps.Marker({
      position: initialPos,
      map: mapInstance,
      draggable: true,
      title: 'Selected Location'
    });

    markerRef.current = marker;

    // Add click listener to map
    mapInstance.addListener('click', (e) => {
      const position = e.latLng;
      marker.setPosition(position);
      
      // Get address from coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onLocationSelect({
            address: results[0].formatted_address,
            lat: position.lat(),
            lng: position.lng(),
            placeId: results[0].place_id
          });
        }
      });
    });

    // Add drag end listener to marker
    marker.addListener('dragend', (e) => {
      const position = e.latLng;
      
      // Get address from coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onLocationSelect({
            address: results[0].formatted_address,
            lat: position.lat(),
            lng: position.lng(),
            placeId: results[0].place_id
          });
        }
      });
    });

    // Trigger initial location selection
    if (initialLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: initialPos }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onLocationSelect({
            address: results[0].formatted_address,
            lat: initialPos.lat,
            lng: initialPos.lng,
            placeId: results[0].place_id
          });
        }
      });
    }
  }, [onLocationSelect, initialLocation]);

  // Search for a location
  const searchLocation = useCallback((address) => {
    if (!map) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        map.setCenter(position);
        map.setZoom(15);
        
        if (markerRef.current) {
          markerRef.current.setPosition(position);
        }
        
        onLocationSelect({
          address: results[0].formatted_address,
          lat: position.lat(),
          lng: position.lng(),
          placeId: results[0].place_id
        });
      }
    });
  }, [map, onLocationSelect]);

  return (
    <div className="location-picker">
      <div className="map-search">
        <input
          type="text"
          placeholder="Search for a location..."
          className="map-search-input"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchLocation(e.target.value);
            }
          }}
        />
        <button 
          type="button"
          className="map-search-button"
          onClick={(e) => {
            const input = e.target.previousElementSibling;
            searchLocation(input.value);
          }}
        >
          Search
        </button>
      </div>
      <div className="map-container">
        <div
          style={{ width: '100%', height: '400px' }}
          ref={(node) => {
            if (node && !map) {
              const mapInstance = new window.google.maps.Map(node, {
                center: initialLocation || { lat: 40.7128, lng: -74.0060 },
                zoom: 13,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
              });
              onMapLoad(mapInstance);
            }
          }}
        />
      </div>
      <div className="map-instructions">
        <p>📍 Click on the map or drag the marker to select a location</p>
        <p>🔍 Use the search bar to find a specific address</p>
      </div>
    </div>
  );
}

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading maps...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading maps</div>;
    case Status.SUCCESS:
      googleMapsLoaded = true;
      return mapComponentProps ? <MapComponent {...mapComponentProps} /> : <div className="map-error">Loading...</div>;
    default:
      return <div className="map-error">Unknown status</div>
  }
};

export default function LocationPicker({ onLocationSelect, initialLocation, isOpen, onClose }) {
  if (!isOpen) return null;

  mapComponentProps = { onLocationSelect, initialLocation };

  return (
    <div className="location-picker-modal">
      <div className="location-picker-overlay" onClick={onClose}></div>
      <div className="location-picker-content">
        <div className="location-picker-header">
          <h3>Select Location</h3>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        {!googleMapsLoaded ? (
          <Wrapper
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            render={render}
            libraries={['places']}
          />
        ) : (
          <MapComponent 
            onLocationSelect={onLocationSelect}
            initialLocation={initialLocation}
          />
        )}
      </div>
    </div>
  );
}
