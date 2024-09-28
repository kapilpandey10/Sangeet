import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Your Supabase client instance
import ConfirmMsg from './ConfirmMsg'; // Assuming you have ConfirmMsg.js for confirmation
import '../style/ReceiveImage.css'; // Add styles here
import { Link } from 'react-router-dom';

const ReceiveImage = () => {
  const [pin, setPin] = useState('');
  const [images, setImages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [largeImageIndex, setLargeImageIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle PIN change for each box
  const handlePinChange = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < 3) {
      document.getElementById(`pin${index + 1}`).focus();
    }
    setPin((prevPin) => {
      const pinArr = prevPin.split('');
      pinArr[index] = value;
      return pinArr.join('');
    });
  };

  // Fetch images based on the entered PIN
  const fetchImages = async () => {
    if (pin.length !== 4) {
      setErrorMessage('Please enter a 4-digit PIN.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('image_uploads')
        .select('file_paths')
        .eq('pin', pin);

      if (error) {
        console.error('Error fetching images:', error.message);
        setErrorMessage('Error fetching images. Please try again.');
      } else if (data && data.length > 0 && data[0].file_paths.length > 0) {
        setImages(data[0].file_paths);
        setErrorMessage('');
      } else {
        setErrorMessage('No images found for this PIN.');
      }
    } catch (err) {
      console.error('Error:', err.message);
      setErrorMessage('Error fetching images.');
    }
  };

  // Handle image download
  const handleDownloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle delete image confirmation
  const handleDeleteImage = (imageUrl) => {
    setImageToDelete(imageUrl);
    setShowConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const fileName = imageToDelete.split('/').pop(); // Extract the file name
      const fullPath = imageToDelete.split('storage/v1/object/public/').pop(); // Get the full path after the storage URL

      // Step 1: Delete the image from the Supabase bucket
      const { error } = await supabase.storage.from('images').remove([fullPath]);

      if (error) {
        console.error('Error deleting file from bucket:', error.message);
        alert('Error deleting file from bucket.');
        return;
      }

      // Step 2: Remove the image URL from the file_paths column in the database
      const updatedFilePaths = images.filter((img) => img !== imageToDelete);

      if (updatedFilePaths.length > 0) {
        // Step 3: Update the file_paths column in the database
        const { error: updateError } = await supabase
          .from('image_uploads')
          .update({ file_paths: updatedFilePaths })
          .eq('pin', pin);

        if (updateError) {
          console.error('Error updating file_paths in database:', updateError.message);
          alert('Error updating file paths in the database.');
          return;
        }
      } else {
        // Step 4: If no more images remain, delete the row from the database
        const { error: deleteRowError } = await supabase
          .from('image_uploads')
          .delete()
          .eq('pin', pin);

        if (deleteRowError) {
          console.error('Error deleting row from database:', deleteRowError.message);
          alert('Error deleting row from database.');
          return;
        }
      }

      // Step 5: Update the UI to reflect the changes
      setImages(updatedFilePaths);
      setShowConfirm(false);
      alert('Image deleted successfully.');
    } catch (err) {
      console.error('Error during deletion process:', err.message);
      alert('Error deleting image.');
    }
  };

  // Open large image modal
  const openLargeImage = (index) => {
    setLargeImageIndex(index);
    setSelectedImage(images[index]);
  };

  // Navigate to the previous image in the modal
  const prevImage = () => {
    if (largeImageIndex > 0) {
      setLargeImageIndex(largeImageIndex - 1);
      setSelectedImage(images[largeImageIndex - 1]);
    }
  };

  // Navigate to the next image in the modal
  const nextImage = () => {
    if (largeImageIndex < images.length - 1) {
      setLargeImageIndex(largeImageIndex + 1);
      setSelectedImage(images[largeImageIndex + 1]);
    }
  };

  // Close the large image modal
  const closeModal = () => {
    setLargeImageIndex(null);
    setSelectedImage(null);
  };

  return (
    <div className="receive-image-container">
      <h1>Retrieve Your Images</h1>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/filetransfer">File Transfer</Link> / Receive Images
      </nav>

      {/* Pin Input */}
      <div className="pin-input">
        <label>Enter your 4-digit PIN:</label>
        <div className="pin-input-boxes">
          {[...Array(4)].map((_, idx) => (
            <input
              key={idx}
              type="text"
              id={`pin${idx}`}
              maxLength="1"
              value={pin[idx] || ''}
              onChange={(e) => handlePinChange(e, idx)}
              className="pin-box"
            />
          ))}
        </div>
        <button onClick={fetchImages} className="fetch-button">
          Fetch Images
        </button>
      </div>

      {/* Error and Success Messages */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="image-preview-container">
          {images.map((imageUrl, index) => (
            <div key={index} className="image-preview">
              <div className="image-overlay">
                <button
                  className="image-action download"
                  onClick={() => handleDownloadImage(imageUrl)}
                >
                  Download
                </button>
                <button
                  className="image-action delete"
                  onClick={() => handleDeleteImage(imageUrl)}
                >
                  Delete
                </button>
              </div>
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                onClick={() => openLargeImage(index)}
                className="image-thumb"
              />
            </div>
          ))}
        </div>
      )}

      {/* Large Image Modal */}
      {selectedImage && (
        <div className="modal">
          <span className="close-modal" onClick={closeModal}>&times;</span>
          <img src={selectedImage} alt="Large View" className="modal-image" />
          <div className="modal-actions">
            <button onClick={prevImage} disabled={largeImageIndex === 0}>
              Prev
            </button>
            <button onClick={nextImage} disabled={largeImageIndex === images.length - 1}>
              Next
            </button>
            <button onClick={() => handleDownloadImage(selectedImage)}>Download</button>
            <button onClick={() => handleDeleteImage(selectedImage)}>Delete</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmMsg
        show={showConfirm}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
        message="Are you sure you want to delete this image?"
        confirmButtonText="Yes, Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default ReceiveImage;
