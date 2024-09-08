import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaCheckCircle, FaEdit, FaEnvelope, FaMusic, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';
import AddLyrics from './AddLyrics';
import AddArtist from './addArtist';
import '../style/AdminDashboard.css';
import { useNavigate } from 'react-router-dom'; // To handle navigation

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
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
      <nav className="top-nav">
        <ul>
          <li className={activeTab === 'add-lyrics' ? 'active' : ''} onClick={() => setActiveTab('add-lyrics')}>
            <FaMusic className="icon" /> Add Lyrics {/* Updated icon */}
          </li>
          <li className={activeTab === 'approve' ? 'active' : ''} onClick={() => setActiveTab('approve')}>
            <FaCheckCircle className="icon" /> Approve
          </li>
          <li className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>
            <FaEdit className="icon" /> Manage
          </li>
          <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            <FaEnvelope className="icon" /> Messages
          </li>
          <li className={activeTab === 'add-artist' ? 'active' : ''} onClick={() => setActiveTab('add-artist')}>
            <FaUserPlus className="icon" /> Add Artist
          </li>
          <li onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="icon" /> Logout {/* Added Logout button */}
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
