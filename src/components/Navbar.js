import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../logo/logo.webp';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  const handleClickOutside = (e) => {
    // Close mobile menu if clicking outside
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on link click
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigate to search results page directly
  const handleSearchClick = () => {
    navigate('/searchresult'); // No search term, just redirect to search page
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hamburger Menu for Mobile */}
        <button
          className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo and Brand Name */}
        <div className="logo-brand-container">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <Link to="/" className="brand-name">
            San<span className="highlight">Geet</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-active' : ''}`} ref={mobileMenuRef}>
          <div className="nav-links">
            <Link to="/" className={isActive('/')} onClick={handleNavLinkClick}>Home</Link>
            <Link to="/lyrics-list" className={isActive('/lyrics-list')} onClick={handleNavLinkClick}>Music Lyrics</Link>
            <Link to="/artistbio" className={isActive('/artistbio')} onClick={handleNavLinkClick}>Artist Bio</Link>
            <Link to="/blogs" className={isActive('/blogs')} onClick={handleNavLinkClick}>Blog</Link>
            <Link to="/filetransfer" className={isActive('/filetransfer')} onClick={handleNavLinkClick}>File Transfer</Link>
            <Link to="/contactus" className={isActive('/contactus')} onClick={handleNavLinkClick}>Contact Us</Link>
            <Link to="/greetings" className={isActive('/greetings')} onClick={handleNavLinkClick}>Greeting card</Link>

          </div>
        </div>

        {/* Search Icon */}
        <button className="search-icon" onClick={handleSearchClick} aria-label="Search">
          <FaSearch />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
