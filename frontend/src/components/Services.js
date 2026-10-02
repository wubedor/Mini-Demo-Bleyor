import React from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const services = [
  {
    name: "Standard/Routine Cleaning",
    description: "This is regular cleaning done daily, weekly, or monthly to maintain cleanliness and hygiene. Choose from our comprehensive cleaning options below:",
    options: [
      "Sweeping & mopping",
      "Dusting",
      "Washrooms cleaning", 
      "Corridors/staircase",
      "Light waste disposal"
    ]
  },
  {
    name: "Deep Cleaning",
    description: "Deep cleaning is a more detailed and intensive service. It covers areas that are not cleaned regularly, such as behind appliances, inside cabinets, scrubbing tiles and grout, washing walls, and removing built-up dirt. It is ideal for seasonal cleaning or before moving in or out. Choose from our comprehensive deep cleaning options below:",
    options: [
      "Scrubbing floors",
      "Walls/tiles washing", 
      "Windows/glass cleaning",
      "Furniture cleaning",
      "Washroom descaling"
    ]
  },
  {
    name: "Post-Construction Cleaning",
    description: "This service is done after building or renovation work. It involves removing construction dust, debris, paint stains, cement residue, and thoroughly cleaning floors, windows, and surfaces to make the space safe, clean, and ready for use. Choose from our comprehensive post-construction cleaning options below:",
    options: [
      "Removing paint marks, cement dust",
      "High-intensity debris removal"
    ]
  },
  {
    name: "Pre & Post Event Cleaning",
    description: "Pre-event cleaning prepares the venue before an event by ensuring the space is spotless and well-arranged. Post-event cleaning focuses on clearing waste, cleaning spills, rearranging furniture, and restoring the venue to its original condition. Choose from our comprehensive event cleaning options below:",
    options: [
      "Venue preparation and restoration"
    ]
  },
  {
    name: "Laundry Services",
    description: "Laundry services include washing, drying, ironing, and folding clothes, bed linens, curtains, and other fabrics. Some services may also include stain removal and dry cleaning to ensure garments are fresh and well cared for. Choose from our comprehensive laundry options below:",
    options: [
      "Washing, drying, ironing"
    ]
  },
];

export default function Services({ setScreen }) {
  const navigate = useNavigate();

  const handleBookClick = (serviceName) => {
    if (setScreen) {
      setScreen("booking");
    } else {
      navigate('/book', { state: { serviceName: serviceName } });
    }
  };

  return (
    <div id="services" className="services-section">
      <h1>Our Services</h1>
      <p>Professional laundry and cleaning services tailored to your needs</p>
      <div className="services-container">
        {services.map((service, idx) => (
          <div key={service.name} className="service-card">
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            {service.options && (
              <div className="service-options">
                <h4>Cleaning Options:</h4>
                <ul>
                  {service.options.map((option, optionIdx) => (
                    <li key={optionIdx}>
                      <span className="option-icon">✓</span>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="service-book-btn" onClick={() => handleBookClick(service.name)}>Book This Service</button>
          </div>
        ))}
      </div>
    </div>
  );
}
