import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/FileTransfer.css';

const FileTransfer = () => {
  const navigate = useNavigate(); // React Router's hook for navigation

  const handleSend = () => {
    // Navigate to the SendImage page
    navigate('/sendimage'); // Assuming your route is set up to go to /sendimage
  };

  const handleReceive = () => {
    // Navigate to the ReceiveImage page (future implementation)
    navigate('/receiveimg'); // Assuming your route is set up to go to /receiveimg
  };

  return (
    <div className="file-transfer-container">
     
      <h1 className="file-transfer-title">Share Your Images Seamlessly</h1>
      <p className="file-transfer-description">
        Use the Send and Receive buttons to transfer your files easily. Images, documents, or anything important can be transferred within seconds.
      </p>

      <div className="button-container">
        <button onClick={handleSend} className="send-button">Send</button>
        <button onClick={handleReceive} className="receive-button">Receive</button>
      </div>
    </div>
  );
};

export default FileTransfer;
