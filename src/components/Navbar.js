import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa'; // Removed FaUser since it's no longer needed
import logo from '../logo/logo.webp'; // Update logo path if needed

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // For detecting active class
  const searchRef = useRef(null); // Reference to search input
  const mobileMenuRef = useRef(null); // Reference to mobile menu

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}&filter=approved`); // Filter search for approved lyrics, title, artists, added_by
    }
  };

  const handleClickOutside = (e) => {
    // Close search if clicking outside
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsSearchActive(false);
    }

    // Close mobile menu if clicking outside
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo and Brand Name */}
        <div className={`logo-brand-container ${isSearchActive ? 'logo-hidden' : ''}`}>
          <img src={logo} alt="Logo" className="navbar-logo" />
          <Link to="/" className="brand-name">
            San<span className="highlight">Geet</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-active' : ''}`} ref={mobileMenuRef}>
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/lyrics-list" className={isActive('/lyrics-list')}>Music Lyrics</Link>
            <Link to="/artistbio" className={isActive('/artistbio')}>Artist Bio</Link>
            <Link to="/contactus" className={isActive('/contactus')}>Contact Us</Link>
            <Link to="/blogs" className={isActive('/blog')}>Blog</Link>


          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <form className={`search-bar ${isSearchActive ? 'active' : ''}`} onSubmit={handleSearch} ref={searchRef}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="button" className="search-icon" onClick={() => setIsSearchActive(!isSearchActive)}>
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
