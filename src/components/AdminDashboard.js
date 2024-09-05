import React, { useState } from 'react';
import '../style/AdminDashboard.css';
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
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li className={activeTab === 'approve' ? 'active' : ''} onClick={() => setActiveTab('approve')}>
            Approve Lyrics
          </li>
          <li className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>
            Manage Lyrics
          </li>
          <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            Messages
          </li>
          
        </ul>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
