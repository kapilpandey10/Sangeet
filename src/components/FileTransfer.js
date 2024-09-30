import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // For SEO meta tags
import '../style/FileTransfer.css';

const FileTransfer = () => {
  const navigate = useNavigate(); // React Router's hook for navigation
  const [loading, setLoading] = useState(true);

  // Simulate a loading state with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Simulate data load
    }, 1000); // 1 second loading time
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    navigate('/sendimage'); // Assuming your route is set up to go to /sendimage
  };

  const handleReceive = () => {
    navigate('/receiveimg'); // Assuming your route is set up to go to /receiveimg
  };

  if (loading) {
    // Skeleton Loader while loading
    return (
      <div className="skeleton-loader">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    );
  }

  return (
    <div className="file-transfer-container">
      {/* Dynamic SEO with Helmet */}
      <Helmet>
        <title>File Transfer - Seamless Image Sharing from Sangeet Lyrics Central</title>
        <meta name="description" content="Transfer your images easily with our Send and Receive feature. A simple and fast way to share files." />
        <meta name="keywords" content="file transfer, image sharing, send files, receive files, seamless file transfer" />
        <meta property="og:title" content="File Transfer - Seamless Image Sharing" />
        <meta property="og:description" content="Use our platform to send and receive files quickly and easily." />
        <meta property="og:type" content="website" />
      </Helmet>

      <h1 className="file-transfer-title">Share Your Images Seamlessly</h1>
      <p className="file-transfer-description">
        Use the Send and Receive buttons to transfer your files easily. Images, documents, or anything important can be transferred within seconds.
      </p>

      <div className="button-container">
        <button onClick={handleSend} className="send-button" aria-label="Send Files">Send</button>
        <button onClick={handleReceive} className="receive-button" aria-label="Receive Files">Receive</button>
      </div>
    </div>
  );
};

export default FileTransfer;
