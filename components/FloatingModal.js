import React, { useState, useEffect } from 'react';
import styles from './style/FloatingModel.module.css'; // CSS module import for Next.js

const FloatingModal = () => {
  const [showModal, setShowModal] = useState(false); // Modal is hidden by default

  // Time interval in milliseconds (5 minutes = 300,000 ms)
  const FIVE_MINUTES = 300000;

  useEffect(() => {
    // Get the last time the modal was shown from localStorage
    const lastShownTime = localStorage.getItem('lastModalShownTime');
    const currentTime = new Date().getTime();

    // If the modal has never been shown, or it has been more than 5 minutes since last shown
    if (!lastShownTime || currentTime - lastShownTime > FIVE_MINUTES) {
      setShowModal(true);
      localStorage.setItem('lastModalShownTime', currentTime); // Update last shown time in localStorage
    }
  }, []);

  // Automatically close the modal after 10 seconds
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 10000); // 10000 ms = 10 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [showModal]);

  // Function to close the modal when 'X' is clicked
  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null; // Don't render if modal is closed

  return (
    <div className={`${styles.floatingModal} ${showModal ? styles.show : styles.hide}`}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose}>X</button>
        <p>
          Scroll down to play Music on{' '}
          <span className={styles.highlight}>YouTube</span>.
        </p>
      </div>
    </div>
  );
};

export default FloatingModal;
