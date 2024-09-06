import React, { useState } from 'react';
import '../style/AdminDashboard.css';
import { FaCheckCircle, FaEdit, FaEnvelope, FaUserPlus } from 'react-icons/fa'; // Add FaUserPlus icon
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';
import AddArtist from './addArtist'; // Import AddArtist component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');

  const renderContent = () => {
    switch (activeTab) {
      case 'approve':
        return <ApproveLyrics />;
      case 'manage':
        return <ManageLyrics />;
      case 'messages':
        return <Messages />;
      case 'add-artist':
        return <AddArtist />; // Render AddArtist form
      default:
        return <ManageLyrics />;
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="top-nav">
        <ul>
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
        </ul>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
