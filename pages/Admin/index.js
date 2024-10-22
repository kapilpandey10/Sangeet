import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { FaCaretDown, FaCheckCircle, FaEdit, FaEnvelope, FaMusic, FaUserPlus, FaSignOutAlt, FaNewspaper } from 'react-icons/fa'; // Icons for menu
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';
import AddLyrics from './AddLyrics';
import AddArtist from './addArtist';
import AddBlog from './addBlog'; // Blog component

import styles from './style/AdminDashboard.module.css'; // CSS module for Next.js
import { useRouter } from 'next/router';
import ManageBlog from './manageblog';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({
    manage: false,
    account: false,
    blog: false,
  }); // Store the dropdown state for each section

  const dropdownRef = useRef(); // Ref for detecting click outside dropdowns
  const router = useRouter(); // Use Next.js router

  // Check if the user is logged in (session check)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
      } else {
        router.push('/login'); // Redirect to login
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  // Handle user logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirect to login after logout
  };

  // Toggle dropdown visibility
  const toggleDropdown = (section) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // Close dropdowns if clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen({ manage: false, account: false, blog: false });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render content based on the active tab
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
      case 'blog':
        return <AddBlog />;
        case 'manageblog':
        return <ManageBlog />;
      default:
        return <ManageLyrics />;
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner
  }

  return (
    <div className={styles.adminDashboard}>
      <nav className={styles.topNav} ref={dropdownRef}>
        <ul className={styles.navList}>
          {/* Manage Dropdown */}
          <li className={styles.navItem}>
            <span onClick={() => toggleDropdown('manage')}>
              Music <FaCaretDown className={styles.caretIcon} />
            </span>
            {dropdownOpen.manage && (
              <ul className={styles.dropdownMenu}>
                <li onClick={() => setActiveTab('add-lyrics')}>
                  <FaMusic className={styles.icon} /> Add Lyrics
                </li>
                <li onClick={() => setActiveTab('approve')}>
                  <FaCheckCircle className={styles.icon} /> Approve Lyrics
                </li>
                <li onClick={() => setActiveTab('manage')}>
                  <FaEdit className={styles.icon} /> Manage Lyrics
                </li>
                <li onClick={() => setActiveTab('add-artist')}>
                  <FaUserPlus className={styles.icon} /> Add Artist
                </li>
                
              </ul>
            )}
          </li>

          {/* Account Dropdown */}
          <li className={styles.navItem}>
            <span onClick={() => toggleDropdown('account')}>
              Account <FaCaretDown className={styles.caretIcon} />
            </span>
            {dropdownOpen.account && (
              <ul className={styles.dropdownMenu}>
                <li onClick={() => setActiveTab('messages')}>
                  <FaEnvelope className={styles.icon} /> Messages
                </li>
                <li onClick={handleLogout}>
                  <FaSignOutAlt className={styles.icon} /> Logout
                </li>
              </ul>
            )}
          </li>

          {/* Blog Dropdown */}
          <li className={styles.navItem}>
            <span onClick={() => toggleDropdown('blog')}>
              Blog <FaCaretDown className={styles.caretIcon} />
            </span>
            {dropdownOpen.blog && (
              <ul className={styles.dropdownMenu}>
                <li onClick={() => setActiveTab('blog')}>
                  <FaNewspaper className={styles.icon} /> Add Blog
                </li>

                <li onClick={() => setActiveTab('manageblog')}>
                  <FaEdit className={styles.icon} /> Manage Blog
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
