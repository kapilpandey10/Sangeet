import React from 'react';
import Styles from './style/ConfirmMsg.module.css'; // Make sure the updated CSS file is included

const ConfirmMsg = ({ show, onConfirm, onCancel, message, confirmButtonText, cancelButtonText }) => {
  if (!show) return null; // Only render the modal if `show` is true

  return (
    <div className={Styles.confirmModalOverlay}> {/* Full-screen overlay */}
      <div className={Styles.confirmModal}> {/* The modal box */}
        <div className={Styles.confirmModalContent}>
          <h2>Confirmation</h2>
          <p>{message}</p>
          <div className={Styles.confirmModalActions}>
            <button 
              className={`${Styles.confirmModalButton} ${Styles.confirm}`} // Corrected className syntax for multiple classes
              onClick={onConfirm}
            >
              {confirmButtonText || 'Yes, Confirm'}
            </button>
            <button 
              className={`${Styles.confirmModalButton} ${Styles.cancel}`} // Applied proper classes to cancel button
              onClick={onCancel}
            >
              {cancelButtonText || 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMsg;
