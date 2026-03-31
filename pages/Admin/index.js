// AdminDashboard.jsx — Dynabeat Command Studio — Premium Redesign
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FaCheckCircle, FaEdit, FaPlus, FaEnvelope,
  FaMusic, FaSignOutAlt, FaNewspaper, FaCogs,
  FaSun, FaMoon, FaLayerGroup
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

const NAV_SECTIONS = [
  {
    label: 'Music',
    items: [
      { id: 'approve',       icon: FaCheckCircle, label: 'Approve Lyrics',  sub: 'Review queue' },
      { id: 'add-lyrics',    icon: FaPlus,        label: 'Add Lyrics',      sub: 'New entry' },
      { id: 'manage',        icon: FaEdit,        label: 'Manage Lyrics',   sub: 'Library' },
    ],
  },
  {
    label: 'Media',
    items: [
      { id: 'blog',          icon: FaPlus,        label: 'New Blog',        sub: 'Compose' },
      { id: 'manageblog',    icon: FaNewspaper,   label: 'Manage Blog',     sub: 'All posts' },
      { id: 'add-artist',    icon: FaMusic,       label: 'Add Artist',      sub: 'New profile' },
      { id: 'manage-artist', icon: FaLayerGroup,  label: 'Manage Artists',  sub: 'Roster' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'messages',      icon: FaEnvelope,    label: 'Messages',        sub: 'Inbox' },
      { id: 'settings',      icon: FaCogs,        label: 'Settings',        sub: 'Preferences' },
    ],
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');
  const [adminEmail, setAdminEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
    else setIsDarkMode(true); // default dark
    fetch('/api/verify-admin')
      .then(r => r.json())
      .then(data => { if (data.authorized && data.email) setAdminEmail(data.email); });
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('adminTheme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    window.location.href = 'https://kapilpandey2068.cloudflareaccess.com/cdn-cgi/access/logout';
  };

  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const currentItem = allItems.find(i => i.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'approve':        return <ApproveLyrics />;
      case 'manage':         return <ManageLyrics />;
      case 'messages':       return <Messages />;
      case 'add-lyrics':     return <AddLyrics />;
      case 'add-artist':     return <AddArtist />;
      case 'blog':           return <AddBlog />;
      case 'manageblog':     return <ManageBlog />;
      case 'manage-artist':  return <ManageArtist />;
      case 'settings':       return (
        <div className={styles.settingsPanel}>
          <h2 className={styles.settingsHeading}>Preferences</h2>
          <div className={styles.settingRow}>
            <div>
              <p className={styles.settingLabel}>Appearance</p>
              <p className={styles.settingHint}>Toggle between light and dark editorial mode</p>
            </div>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              {isDarkMode ? <><FaSun /> Light mode</> : <><FaMoon /> Dark mode</>}
            </button>
          </div>
          <p className={styles.settingsNote}>
            Preferences are device-local and do not affect the public site.
          </p>
        </div>
      );
      default: return <ManageLyrics />;
    }
  };

  return (
    <div className={`${styles.shell} ${isDarkMode ? styles.dark : styles.light}`}>

      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sideOpen : ''}`}>

        {/* Masthead */}
        <div className={styles.masthead}>
          <p className={styles.mastheadEyebrow}>Command Studio</p>
          <p className={styles.mastheadTitle}>DYNABEAT</p>
          <p className={styles.mastheadCaption}>Admin Dashboard</p>
          <div className={styles.mastheadRule}>
            <div className={styles.mastheadRuleDot} />
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label} className={styles.navGroup}>
              <span className={styles.navGroupLabel}>{label}</span>
              {items.map(({ id, icon: Icon, label: itemLabel, sub }) => (
                <button
                  key={id}
                  className={`${styles.navItem} ${activeTab === id ? styles.navActive : ''}`}
                  onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabels}>
                    <span className={styles.navLabel}>{itemLabel}</span>
                    <span className={styles.navSub}>{sub}</span>
                  </span>
                  {activeTab === id && <span className={styles.activeBar} />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={styles.sideFooter}>
          {adminEmail && (
            <div className={styles.userBlock}>
              <div className={styles.avatar}>{adminEmail[0].toUpperCase()}</div>
              <div className={styles.userMeta}>
                <span className={styles.userRole}>Administrator</span>
                <span className={styles.userEmail}>{adminEmail}</span>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>

        {/* Top strip */}
        <header className={styles.topStrip}>
          <button className={styles.hamburger} onClick={() => setMobileOpen(true)}>
            <span /><span /><span />
          </button>
          <div className={styles.topCenter}>
            <span className={styles.topIssue}>Vol. I</span>
            <span className={styles.topEm}>&mdash;</span>
            <span className={styles.topSection}>{currentItem?.label || 'Dashboard'}</span>
          </div>
          <span className={styles.topDate}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </header>

        {/* Page title */}
        <div className={styles.pageHeading}>
          <p className={styles.pageEyebrow}>{currentItem?.sub || 'Module'}</p>
          <h1 className={styles.pageTitle}>{currentItem?.label || 'Dashboard'}</h1>
          <div className={styles.titleRule} />
        </div>

        <div className={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;