import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            🏠 Go Home
          </Link>
          <Link to="/services" className="services-button">
            🧺 View Services
          </Link>
        </div>
        
        <div className="not-found-help">
          <h3>What can you do?</h3>
          <ul>
            <li>Go back to the home page</li>
            <li>Browse our laundry services</li>
            <li>Contact us for assistance</li>
            <li>Check the URL for typos</li>
          </ul>
        </div>
      </div>
      
      <div className="not-found-background">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
      </div>
    </div>
  );
};

export default NotFound;
