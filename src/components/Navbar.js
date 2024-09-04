import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';
import logo from '../logo/logo.png'; // Import the logo

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add meta tags for SEO
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Sangit Lyrics Central - Your go-to site for submitting and discovering song lyrics, from artists and writers alike.';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'lyrics, song lyrics, music, artists, songwriters, submit lyrics';
    document.head.appendChild(metaKeywords);

    return () => {
      // Cleanup meta tags on unmount
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
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
        <div className="logo">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logo} alt="Logo" className="navbar-logo" />
            <span className="navbar-text">Sangit</span>
          </Link>
        </div>
        <button
          className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className={`links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <Link to="/add" className={isActive('/add')} onClick={toggleMobileMenu}>Submit Lyrics</Link>
          <Link to="/lyrics" className={isActive('/lyrics')} onClick={toggleMobileMenu}>View Lyrics</Link>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search Lyrics, Artists, Writer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
