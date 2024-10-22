import { useState, useEffect } from 'react';
import styles from './style/FloatingModal.module.css'; // CSS module import for Next.js

const FloatingModal = () => {
  const [showModal, setShowModal] = useState(false); // Modal is hidden by default

  // Time interval in milliseconds (5 minutes = 300,000 ms)
  const FIVE_MINUTES = 30;

  useEffect(() => {
    const lastShownTime = localStorage.getItem('lastModalShownTime');
    const currentTime = new Date().getTime();

    // Show modal if it's been more than 5 minutes since it was last shown
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
      }, 10000); // Close modal after 10 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [showModal]);

  // Function to close the modal when 'X' is clicked
  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null; // Don't render if modal is closed

  return (
    <div className={styles.floatingModal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        <p>
          Scroll down to play Music on{' '}
          <span className={styles.highlight}>YouTube</span>.
        </p>
      </div>
    </div>
  );
};

export default FloatingModal;
