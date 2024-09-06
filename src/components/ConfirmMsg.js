import React from 'react';
import '../style/ConfirmMsg.css';

const ConfirmMsg = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div className="confirm-modal">
      <div className="confirm-modal-content">
        <h2>Confirm Delete</h2>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-button confirm" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="confirm-modal-button cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMsg;
