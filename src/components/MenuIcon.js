import React from 'react';
import './MenuIcon.css';

export default function MenuIcon({ isOpen, size = 24 }) {
  return (
    <div className={`menu-icon ${isOpen ? 'open' : ''}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </div>
  );
}
