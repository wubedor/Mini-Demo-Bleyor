import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SimpleServices.css';

const SimpleServices = () => {
  const navigate = useNavigate();
  const services = [
    {
      title: "Standard/Routine Cleaning",
      description: "This is regular cleaning done daily, weekly, or monthly to maintain cleanliness and hygiene. It includes sweeping, mopping, dusting, vacuuming, cleaning bathrooms, wiping surfaces, and taking out trash. It helps keep homes or offices neat and organized.",
      icon: ""
    },
    {
      title: "Laundry Services",
      description: "Laundry services include washing, drying, ironing, and folding clothes, bed linens, curtains, and other fabrics. Some services may also include stain removal and dry cleaning to ensure garments are fresh and well cared for.",
      icon: ""
    },
    {
      title: "Deep Cleaning",
      description: "Deep cleaning is a more detailed and intensive service. It covers areas that are not cleaned regularly, such as behind appliances, inside cabinets, scrubbing tiles and grout, washing walls, and removing built-up dirt. It is ideal for seasonal cleaning or before moving in or out.",
      icon: ""
    },
    {
      title: "Post-Construction Cleaning",
      description: "This service is done after building or renovation work. It involves removing construction dust, debris, paint stains, cement residue, and thoroughly cleaning floors, windows, and surfaces to make the space safe, clean, and ready for use.",
      icon: ""
    },
    {
      title: "Pre & Post Event Cleaning",
      description: "Pre-event cleaning prepares the venue before an event by ensuring the space is spotless and well-arranged. Post-event cleaning focuses on clearing waste, cleaning spills, rearranging furniture, and restoring the venue to its original condition.",
      icon: ""
    }
  ];

  return (
    <div className="simple-services">
      <h2 className="services-title">Our Professional Services</h2>
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className={`service-card ${!service.icon ? 'no-icon' : ''}`}>
            <div className="service-icon">
              <span className="material-icons">{service.icon}</span>
            </div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <button
              type="button"
              className="book-service-button"
              onClick={() => navigate('/book', { state: { selectedService: service.title.trim() } })}
            >
              Book This Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleServices;
