import React from 'react';
import './SimpleMenuIcon.css';

const SimpleMenuIcon = ({ isOpen }) => {
  return (
    <div 
      className={`simple-menu-icon ${isOpen ? 'open' : ''}`}
      aria-hidden="true"
    >
      <span className="menu-line"></span>
      <span className="menu-line"></span>
      <span className="menu-line"></span>
    </div>
  );
};

export default SimpleMenuIcon;
