import React from 'react';
import styles from './style/WarningModal.module.css'; // Import the CSS for the modal

const WarningModal = () => {
  return (
    <div className={styles.modaloverlay}>
      <div className={styles.modalcontent}>
        <h2>Warning!</h2>
        <p>This site is protected from inspection.</p>
        <button onClick={() => window.location.reload()}>Close </button>
      </div>
    </div>
  );
};

export default WarningModal;
