import React, { useState, useEffect } from 'react';
import '../style/FloatingModel.css'; // We'll create this CSS for styling
const FloatingModal = () => {
    const [showModal, setShowModal] = useState(true); // Modal is visible by default
  
    // Automatically close the modal after 10 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 10000); // 10000 ms = 10 seconds
  
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);
  
    // Function to close the modal when 'X' is clicked
    const handleClose = () => {
      setShowModal(false);
    };
  
    if (!showModal) return null; // Don't render if modal is closed
  
    return (
      <div className={`floating-modal ${showModal ? 'show' : 'hide'}`}>
        <div className="modal-content">
          <button className="close-button" onClick={handleClose}>X</button>
          <p>
            Scroll down to play Music on{' '}
            <span className="highlight">YouTube</span>.
          </p>
        </div>
      </div>
    );
  };
  
  export default FloatingModal;