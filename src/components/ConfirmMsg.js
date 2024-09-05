import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; 
import '../style/ConfirmMsg.css'; // Import the CSS for styling

const ConfirmMsg = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal animate">
        <div className="confirm-header">
          <h2>Confirmation</h2>
        </div>
        <div className="confirm-body">
          <p>{message || "Are you sure you want to proceed?"}</p>
        </div>
        <div className="confirm-actions">
          <button onClick={onConfirm} className="confirm-btn yes-btn">
            <FaCheckCircle className="icon" /> Yes
          </button>
          <button onClick={onCancel} className="confirm-btn cancel-btn">
            <FaTimesCircle className="icon" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMsg;
