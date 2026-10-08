import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuIcon from './MenuIcon';
import './Header.css';
import Logo from './Logo';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    
    // Navigate to home page
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleBackdropClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="app-header-container">
        <div className="logo-container">
          <Link to="/" className="logo-link" onClick={handleLinkClick}>
            <Logo />
          </Link>
        </div>
        
        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon isOpen={isMenuOpen} size={24} />
        </button>
        
        <nav className={`navigation ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><NavLink to="/" end onClick={handleLinkClick}>Home</NavLink></li>
            <li><NavLink to="/services" onClick={handleLinkClick}>Services</NavLink></li>
            <li><NavLink to="/about" onClick={handleLinkClick}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={handleLinkClick}>Contact</NavLink></li>
            {user ? (
              <>
                <li><NavLink to="/my-bookings" onClick={handleLinkClick}>My Bookings</NavLink></li>
                <li><NavLink to="/my-applications" onClick={handleLinkClick}>My Applications</NavLink></li>
                <li><NavLink to="/profile" onClick={handleLinkClick}>Profile</NavLink></li>
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <>
                    <li><NavLink to="/job-applications" onClick={handleLinkClick}>Job Applications</NavLink></li>
                    <li><NavLink to="/admin-dashboard" onClick={handleLinkClick}>Admin Dashboard</NavLink></li>
                  </>
                )}
                <li><NavLink to="/employees" onClick={handleLinkClick}>Careers</NavLink></li>
                <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" onClick={handleLinkClick}>Login</Link></li>
            )}
            <li><Link to="/book" className="button" onClick={handleLinkClick}>Book Now</Link></li>
          </ul>
        </nav>
      </header>
      
      {isMenuOpen && (
        <div 
          className="menu-backdrop" 
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}