import React, { useState } from 'react';
import '../style/AdminDashboard.css';
import { FaCheckCircle, FaEdit, FaEnvelope } from 'react-icons/fa';
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';

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
      default:
        return <ApproveLyrics />;
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
        </ul>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
