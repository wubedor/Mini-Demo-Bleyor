import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import MenuIcon from './MenuIcon';
import './Header.css';
import Logo from './Logo';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Sign out from Firebase if available
    if (auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.warn('Firebase signOut failed:', error);
      }
    }
    
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
            <li><NavLink to="/app" onClick={handleLinkClick}>📱 Get App</NavLink></li>
            {user ? (
              <>
                <li><NavLink to="/my-bookings" onClick={handleLinkClick}>My Bookings</NavLink></li>
                <li><NavLink to="/profile" onClick={handleLinkClick}>Profile</NavLink></li>
                <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
              </>
            ) : null}
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