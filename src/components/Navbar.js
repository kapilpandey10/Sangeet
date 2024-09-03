import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Navbar.css';
import logo from '../logo/logo.png'; // Import the logo

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="navbar-text">Sangeet</span>
        </Link>
      </div>
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="links">
      
        <Link to="/lyrics">View Lyrics</Link>
        <Link to="/add">Add Lyrics</Link>
      </div>
    </nav>
  );
};

export default Navbar;
