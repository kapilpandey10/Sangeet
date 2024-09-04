import React from 'react';
import '../style/verified.css'; // Import the CSS file

const Verified = () => {
  return (
    <div className="verified-container">
      <div className="verified-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#1DA1F2"/>
          <path d="M9 12.5L11 14.5L15 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="verified-text">Verified by Admin</span>
    </div>
  );
};

export default Verified;
