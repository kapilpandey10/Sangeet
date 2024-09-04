import React, { useState } from 'react';
import '../style/AdminDashboard.css';
import ApproveLyrics from './ApproveLyrics';
import ManageLyrics from './ManageLyrics';
import Messages from './Messages';
import AddYouTubeVideo from './AddYouTubeVideo'; // Import the AddYouTubeVideo component

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
      case 'youtube': // Add a case for YouTube video management
        return <AddYouTubeVideo />;
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
          <li onClick={() => setActiveTab('messages')}>Messages</li>
          <li onClick={() => setActiveTab('youtube')}>Add YouTube Video</li> {/* Add YouTube Video option */}
        </ul>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
