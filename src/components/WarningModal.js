import React from 'react';
import '../style/WarningModal.css'; // Import the CSS for the modal

const WarningModal = () => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Warning!</h2>
        <p>This site is protected from inspection.</p>
        <button onClick={() => window.location.reload()}>Close </button>
      </div>
    </div>
  );
};

export default WarningModal;
