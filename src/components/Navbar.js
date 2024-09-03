import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';
import logo from '../logo/logo.png'; // Import the logo

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          <Link to="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
            <span className="navbar-text">Sangit</span>
          </Link>
        </div>
        <button 
          className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMobileMenu}
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
              placeholder="Search lyrics..."
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
