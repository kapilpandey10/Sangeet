import React from 'react';
import '../style/ConfirmMsg.css';

const ConfirmMsg = ({ show, onConfirm, onCancel, message, confirmButtonText, cancelButtonText }) => {
  if (!show) return null;

  return (
    <div className="confirm-modal">
      <div className="confirm-modal-content">
        <h2>Confirmation</h2> {/* More generic title */}
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-button confirm" onClick={onConfirm}>
            {confirmButtonText || 'Yes, Confirm'} {/* Default to "Yes, Confirm" */}
          </button>
          <button className="confirm-modal-button cancel" onClick={onCancel}>
            {cancelButtonText || 'Cancel'} {/* Default to "Cancel" */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMsg;
