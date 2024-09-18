import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { FaCaretDown, FaCheckCircle, FaEdit, FaEnvelope, FaMusic, FaUserPlus, FaSignOutAlt, FaUsersCog } from 'react-icons/fa'; // Import the admin icon
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from '../Messages';
import AddLyrics from './AddLyrics';
import AddArtist from './addArtist';
import './style/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false); // Manage dropdown
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false); // Account dropdown
  const dropdownRef = useRef(); // Ref for detecting click outside dropdowns
  const navigate = useNavigate();

  // Check if the user is logged in (session check)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
      } else {
        navigate('/admin-login'); // If no session, redirect to login
      }
      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  // Handle user logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login'); // Redirect to login after logout
  };

  // Toggle the manage dropdown
  const toggleManageDropdown = () => {
    setManageDropdownOpen(!manageDropdownOpen);
    setAccountDropdownOpen(false); // Close the other dropdown
  };

  // Toggle the account dropdown
  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
    setManageDropdownOpen(false); // Close the other dropdown
  };

  // Close dropdowns if clicking outside the menu area
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setManageDropdownOpen(false);
      setAccountDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'approve':
        return <ApproveLyrics />;
      case 'manage':
        return <ManageLyrics />;
      case 'messages':
        return <Messages />;
      case 'add-lyrics':
        return <AddLyrics />;
      case 'add-artist':
        return <AddArtist />;
   
      default:
        return <ManageLyrics />;
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading spinner while checking session
  }

  return (
    <div className="admin-dashboard">
      <nav className="top-nav" ref={dropdownRef}>
        <ul>
          {/* Manage Dropdown */}
          <li className="dropdown">
            <span onClick={toggleManageDropdown}>
              Manage <FaCaretDown className="caret-icon" />
            </span>
            {manageDropdownOpen && (
              <ul className="dropdown-menu">
                <li onClick={() => setActiveTab('add-lyrics')}>
                  <FaMusic className="icon" /> Add Lyrics
                </li>
                <li onClick={() => setActiveTab('approve')}>
                  <FaCheckCircle className="icon" /> Approve Lyrics
                </li>
                <li onClick={() => setActiveTab('manage')}>
                  <FaEdit className="icon" /> Manage Lyrics
                </li>
                <li onClick={() => setActiveTab('add-artist')}>
                  <FaUserPlus className="icon" /> Add Artist
                </li>
              </ul>
            )}
          </li>

          {/* Account Dropdown */}
          <li className="dropdown">
            <span onClick={toggleAccountDropdown}>
              Account <FaCaretDown className="caret-icon" />
            </span>
            {accountDropdownOpen && (
              <ul className="dropdown-menu">
                <li onClick={() => setActiveTab('messages')}>
                  <FaEnvelope className="icon" /> Messages
                </li>
                <li onClick={() => setActiveTab('admin-management')}>
                  <FaUsersCog className="icon" /> Admin Management
                </li> {/* New admin management option */}
                <li onClick={handleLogout}>
                  <FaSignOutAlt className="icon" /> Logout
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
