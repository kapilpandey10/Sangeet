import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaMusic, FaNewspaper, FaMicrophone, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import AdminRoute from '../pages/Admin/AdminRoute';
import styles from './style/AdminLayout.module.css';
import { supabase } from '../supabaseClient';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/Admin/AdminLogin');
  };

  const navItems = [
    { id: 'approve', name: 'Lyrics Approval', icon: <FaMusic /> },
    { id: 'blog', name: 'Write Story', icon: <FaNewspaper /> },
    { id: 'manage-artist', name: 'Artist Hub', icon: <FaMicrophone /> },
    { id: 'analytics', name: 'Growth Stats', icon: <FaChartLine /> },
  ];

  return (
    <AdminRoute>
      <div className={styles.adminWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>Dyna<span>Beat</span></div>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <button 
                key={item.id}
                className={activeTab === item.id ? styles.activeLink : styles.link}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon} <span>{item.name}</span>
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <FaSignOutAlt /> Logout
          </button>
        </aside>
        
        <main className={styles.mainArea}>
          <header className={styles.topHeader}>
             <h2>System Command</h2>
             <div className={styles.userBadge}>Admin</div>
          </header>
          <div className={styles.viewPort}>{children}</div>
        </main>
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;