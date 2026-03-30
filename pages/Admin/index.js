// File location: components/Admin/AdminDashboard.jsx
// Supabase auth has been removed — logout now clears the Cloudflare Access token

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Still used for DATABASE queries only
import { 
  FaCheckCircle, FaEdit, FaPlus, FaEnvelope, FaSun, FaMoon,
  FaMusic, FaUserPlus, FaSignOutAlt, FaNewspaper, FaBroadcastTower, FaCogs, FaEye 
} from 'react-icons/fa';
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';
import AddLyrics from './AddLyrics';
import AddArtist from './addArtist';
import AddBlog from './addBlog'; 
import ManageBlog from './manageblog';
import ManageArtist from './ManageArtist';
import styles from './style/AdminDashboard.module.css';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');
  const [adminEmail, setAdminEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [glassIntensity, setGlassIntensity] = useState(70);
  const router = useRouter();

  useEffect(() => {
    // Load saved UI preferences
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');

    // Get the admin's email from the verified Cloudflare token
    fetch('/api/verify-admin')
      .then(r => r.json())
      .then(data => {
        if (data.authorized && data.email) {
          setAdminEmail(data.email);
        }
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('adminTheme', newTheme ? 'dark' : 'light');
  };

  // Logout: clear the Cloudflare Access cookie then redirect
  const handleLogout = async () => {
    // This Cloudflare endpoint clears the CF_Authorization cookie
    window.location.href = 'https://kapilpandey2068.cloudflareaccess.com/cdn-cgi/access/logout';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'approve': return <ApproveLyrics />;
      case 'manage': return <ManageLyrics />;
      case 'messages': return <Messages />;
      case 'add-lyrics': return <AddLyrics />;
      case 'add-artist': return <AddArtist />;
      case 'blog': return <AddBlog />;
      case 'manageblog': return <ManageBlog />;
      case 'manage-artist': return <ManageArtist />;
   
      case 'settings': return (
        <div className={styles.settingsPanel}>
          <h3>Dashboard Calibrations</h3>
          <div className={styles.settingRow}>
            <label>High-Contrast Dark Mode</label>
            <button onClick={toggleTheme} className={styles.toggleBtn}>
              {isDarkMode ? <FaSun /> : <FaMoon />} {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
          <div className={styles.settingRow}>
            <label>Glass Transparency ({glassIntensity}%)</label>
            <input 
              type="range" min="10" max="90" 
              value={glassIntensity} 
              onChange={(e) => setGlassIntensity(e.target.value)} 
            />
          </div>
          <p className={styles.hint}>Settings are local to this device and don't affect your public site.</p>
        </div>
      );
      default: return <ManageLyrics />;
    }
  };

  return (
    <div 
      className={`${styles.adminDashboard} ${isDarkMode ? styles.ultraDark : styles.lightMode}`}
      style={{ '--glass-opacity': `${glassIntensity / 100}` }}
    >
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Dyna<span>Beat</span> Admin</div>
        
        <nav className={styles.sideNav}>
          <div className={styles.sectionLabel}>Music</div>
          <button className={activeTab === 'approve' ? styles.active : ''} onClick={() => setActiveTab('approve')}><FaCheckCircle /> Approve Lyrics</button>
          <button className={activeTab === 'add-lyrics' ? styles.active : ''} onClick={() => setActiveTab('add-lyrics')}><FaPlus /> Add Lyrics</button>
          <button className={activeTab === 'manage' ? styles.active : ''} onClick={() => setActiveTab('manage')}><FaEdit /> Manage Lyrics</button>

          <div className={styles.sectionLabel}>Media</div>
          <button className={activeTab === 'blog' ? styles.active : ''} onClick={() => setActiveTab('blog')}><FaPlus /> New Blog</button>
          <button className={activeTab === 'manageblog' ? styles.active : ''} onClick={() => setActiveTab('manageblog')}><FaNewspaper /> Manage Blog</button>
    
          <div className={styles.sectionLabel}>System</div>
          <button className={activeTab === 'settings' ? styles.active : ''} onClick={() => setActiveTab('settings')}><FaCogs /> UI Settings</button>
          <button className={activeTab === 'messages' ? styles.active : ''} onClick={() => setActiveTab('messages')}><FaEnvelope /> Messages</button>
          
          <button className={styles.logoutBtn} onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </nav>
      </aside>

      <main className={styles.mainArea}>
        <header className={styles.topHeader}>
           <div className={styles.headerInfo}>
              <h2>{activeTab.toUpperCase()}</h2>
              <span className={styles.statusBadge}><FaEye /> Command Mode</span>
           </div>
           {/* Show the logged-in admin's email */}
           <div className={styles.userBadge}>{adminEmail || 'Admin Session'}</div>
        </header>
        <div className={styles.scrollContent}>
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
