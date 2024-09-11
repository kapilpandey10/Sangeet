import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import supabase client
import '../style/Navbar.css';
import { FaSearch, FaUser, FaBars, FaTimes } from 'react-icons/fa'; // Import icons
import logo from '../logo/logo.webp'; // Update logo path if needed

const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status
  const [userEmail, setUserEmail] = useState(''); // To store user email
  const navigate = useNavigate();
  const location = useLocation(); // For detecting active class
  const searchRef = useRef(null); // Reference to search input
  const mobileMenuRef = useRef(null); // Reference to mobile menu

  // Log the stored values
  useEffect(() => {
    console.log('Loading stored login session...');

    const fetchStatus = async () => {
      const email = localStorage.getItem('userEmail');
      const loginTime = localStorage.getItem('loginTime');
      const currentTime = Date.now();

      console.log(`Stored email: ${email}`);
      console.log(`Stored loginTime: ${loginTime}`);
      console.log(`Current time: ${currentTime}`);

      if (email && loginTime) {
        const timeSinceLogin = currentTime - parseInt(loginTime, 10);
        console.log(`Time since login: ${timeSinceLogin} ms`);

        // If the login time is within the last 10 minutes, keep the user logged in
        if (timeSinceLogin < AUTO_LOGOUT_TIME) {
          console.log('User is still within the 10-minute window. Keeping logged in.');
          setUserEmail(email);  // Set the user email for the session
          setIsLoggedIn(true);  // Set user as logged in
        } else {
          console.log('10-minute window expired. Logging out user.');
          await handleLogout();
        }
      } else {
        console.log('No valid login session found.');
      }
    };

    fetchStatus();
  }, []);

  // Auto-logout function after 10 minutes
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Setting up auto-logout timer...');
      const logoutTimer = setTimeout(async () => {
        console.log('Auto-logout triggered.');
        await handleLogout();
      }, AUTO_LOGOUT_TIME - (Date.now() - parseInt(localStorage.getItem('loginTime'), 10)));

      return () => clearTimeout(logoutTimer); // Clear the timer on unmount
    }
  }, [isLoggedIn]);

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

  const handleLogout = async () => {
    // Update status to 'out' in Supabase on logout
    const email = localStorage.getItem('userEmail');
    if (email) {
      console.log('Logging out user:', email);
      const { error } = await supabase
        .from('admin')
        .update({ status: 'out' })
        .eq('email', email);

      if (error) {
        console.error('Error updating status:', error);
      } else {
        console.log('Status updated to "out". Logging out.');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginTime');
        setIsLoggedIn(false);
        setUserEmail(''); // Clear the stored user email
        navigate('/login'); // Redirect to login page
      }
    }
  };

  const handleLogin = (email) => {
    // This function should be called upon successful login
    console.log('Logging in user:', email);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loginTime', Date.now().toString()); // Store login time
    setUserEmail(email);
    setIsLoggedIn(true);
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
            <Link to="/lyrics-list" className={isActive('/lyrics-list')}>View Lyrics</Link>
            <Link to="/artistbio" className={isActive('/artistbio')}>Artist Bio</Link>
            <Link to="/contactus" className={isActive('/contactus')}>Contact Us</Link>
          </div>
        </div>

        {/* Search Bar and Login/Logout */}
        <div className="search-login-container">
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

          {/* Login or Logout Button */}
          <div className={`login-button ${isSearchActive ? 'hidden' : ''}`}>
            {isLoggedIn ? (
              <button className="logout-btn" onClick={handleLogout}>
                <FaUser className="login-icon" /> Logout
              </button>
            ) : (
              <Link to="/admin-login">
                <FaUser className="login-icon" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
