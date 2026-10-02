import React, { useState } from "react";
import "./GlobalCampus.css";

const locations = [
  {
    name: "ACCRA",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "KUMASI",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1964&auto=format&fit=crop",
  },
  {
    name: "TAKORADI",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function GlobalCampus() {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (locationName) => {
    setImageErrors(prev => ({
      ...prev,
      [locationName]: true
    }));
  };

  return (
    <div className="global-campus">
      <div className="global-campus-header">
        <h1>Our Service Locations</h1>
        <p>Professional cleaning services across multiple cities in Ghana.</p>
      </div>
      <div className="locations-container">
        {locations.map((location) => (
          <div
            key={location.name}
            className={`location-card ${imageErrors[location.name] ? 'image-error' : ''}`}
            style={{ 
              backgroundImage: imageErrors[location.name] 
                ? 'none' 
                : `url(${location.image})` 
            }}
          >
            <img
              src={location.image}
              alt={location.name}
              onError={() => handleImageError(location.name)}
              style={{ display: 'none' }}
            />
            <div className="location-card-overlay">
              <h3>{location.name}</h3>
              {imageErrors[location.name] && (
                <p className="error-text">Image unavailable</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
