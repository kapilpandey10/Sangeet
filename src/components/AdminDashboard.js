import React, { useState } from 'react';
import '../style/AdminDashboard.css';
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages'; // Import the Messages component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approve');

  const renderContent = () => {
    switch (activeTab) {
      case 'approve':
        return <ApproveLyrics />;
      case 'manage':
        return <ManageLyrics />;
      case 'messages': // Add a case for Messages
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
          <li onClick={() => setActiveTab('approve')}>Approve Lyrics</li>
          <li onClick={() => setActiveTab('manage')}>Manage Lyrics</li>
          <li onClick={() => setActiveTab('messages')}>Messages</li> {/* Add Messages option */}
        </ul>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
