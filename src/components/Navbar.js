import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';
import logo from '../logo/logo.webp'; // Update the logo path accordingly

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set the meta description dynamically
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Sangeet Lyrics Central - Your ultimate destination for song lyrics, artist bios, and more.';
    document.head.appendChild(metaDescription);
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'lyrics, songs, music, artists, Sangeet';
    document.head.appendChild(metaKeywords);
    // Clean up to avoid duplicate meta tags
    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
      setIsMobileMenuOpen(false); // Close the menu after search
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand Name */}
        <div className="logo-container">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logo} alt="Sangeet Logo" className="navbar-logo" width="50" height="50" />
            <span className="navbar-title">Sangeet</span>
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <button
          className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navbar Links and Search wrapped inside mobile menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <div className="nav-links">
            <Link to="/lyrics" className={isActive('/lyrics')} onClick={toggleMobileMenu}>
              View Lyrics
            </Link>
            <Link to="/add" className={isActive('/add')} onClick={toggleMobileMenu}>
              Submit Lyrics
            </Link>
            <Link to="/bhajan" className={isActive('/bhajan')} onClick={toggleMobileMenu}>
              Bhajan
            </Link>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search Lyrics, Artists, Writers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
