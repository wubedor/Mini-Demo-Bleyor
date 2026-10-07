import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  const navigate = useNavigate();

  const handleBookService = (serviceName) => {
    // Navigate to booking page with service pre-selected
    navigate('/book', { state: { service: serviceName } });
  };

  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-hero">
          <h1>About SAMB's Laundry</h1>
          <p className="hero-subtitle">Premium Laundry & Cleaning Services in Accra, Ghana</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              SAMB's Laundry and Klinin Services has been serving the Greater Accra region with professional laundry and cleaning solutions. We understand that your time is valuable, which is why we offer convenient pickup and delivery services to fit your busy schedule.
            </p>
            <p>
              From everyday laundry to specialized dry cleaning, our team of experienced professionals ensures that your garments and linens receive the care they deserve. We use eco-friendly products and state-of-the-art equipment to deliver exceptional results every time.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              To provide premium laundry and cleaning services that exceed customer expectations through quality, reliability, and exceptional customer service. We are committed to making laundry day the easiest day of your week.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Quality</h3>
                <p>We never compromise on quality. Every item is treated with the utmost care and attention to detail.</p>
              </div>
              <div className="value-card">
                <h3>Reliability</h3>
                <p>We deliver on our promises. On-time pickup and delivery is our commitment to you.</p>
              </div>
              <div className="value-card">
                <h3>Customer Satisfaction</h3>
                <p>Your satisfaction is our priority. We go above and beyond to ensure you're happy with our services.</p>
              </div>
              <div className="value-card">
                <h3>Sustainability</h3>
                <p>We use eco-friendly products and practices to minimize our environmental impact.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Services</h2>
            <p className="services-intro">Click on any service to book an appointment:</p>
            <div className="services-list">
              <div className="service-item clickable" onClick={() => handleBookService('Standard Laundry')}>
                <h3>Standard Laundry</h3>
                <p>Daily, weekly, or monthly cleaning to maintain cleanliness and hygiene in your home or office.</p>
                <button className="book-service-btn">Book Now</button>
              </div>
              <div className="service-item clickable" onClick={() => handleBookService('Dry Cleaning')}>
                <h3>Dry Cleaning</h3>
                <p>Professional care for delicate fabrics, formal wear, and garments that require special attention.</p>
                <button className="book-service-btn">Book Now</button>
              </div>
              <div className="service-item clickable" onClick={() => handleBookService('Deep Cleaning')}>
                <h3>Deep Cleaning</h3>
                <p>Intensive cleaning covering areas not cleaned regularly, perfect for seasonal cleaning or moving in/out.</p>
                <button className="book-service-btn">Book Now</button>
              </div>
              <div className="service-item clickable" onClick={() => handleBookService('Post-Construction Cleaning')}>
                <h3>Post-Construction Cleaning</h3>
                <p>Thorough cleaning after building or renovation work to make spaces safe and ready for use.</p>
                <button className="book-service-btn">Book Now</button>
              </div>
              <div className="service-item clickable" onClick={() => handleBookService('Pre & Post Event Cleaning')}>
                <h3>Pre & Post Event Cleaning</h3>
                <p>Venue preparation and cleanup for events, ensuring your space is spotless before and after.</p>
                <button className="book-service-btn">Book Now</button>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Why Choose Us?</h2>
            <ul className="benefits-list">
              <li>✅ Free pickup and delivery service</li>
              <li>✅ Competitive pricing with no hidden fees</li>
              <li>✅ Eco-friendly cleaning products</li>
              <li>✅ Experienced and trained staff</li>
              <li>✅ Fast turnaround times</li>
              <li>✅ Quality guarantee on all services</li>
              <li>✅ Flexible scheduling options</li>
              <li>✅ Secure handling of your belongings</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Contact Us</h2>
            <div className="contact-info">
              <p><strong>Email:</strong> sambsKlinin@gmail.com</p>
              <p><strong>Phone:</strong> Available during business hours</p>
              <p><strong>Location:</strong> Greater Accra, Ghana</p>
              <p><strong>Hours:</strong> Monday - Saturday, 8:00 AM - 6:00 PM</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
