import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Your Supabase client instance
import '../style/SendImage.css';

const SendImage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [pin, setPin] = useState('');

  // Allowed file types
  const allowedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/heif',
    'image/heic',
    'image/webp'
  ];

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => allowedFileTypes.includes(file.type));

    if (validFiles.length > 10) {
      alert('You can only select up to 10 images.');
      return;
    }

    if (validFiles.length !== files.length) {
      alert('Some files are not valid images. Only PNG, JPG, JPEG, GIF, HEIF, HEIC, and WEBP formats are allowed.');
      return;
    }

    setSelectedFiles(validFiles);
  };

  // Generate a 4-digit random PIN
  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Handle upload logic
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select some images to upload.');
      return;
    }

    setUploadStatus('Uploading...');

    try {
      const generatedPin = generatePin();
      setPin(generatedPin); // Set the PIN once for all files

      const uploadedFilePaths = [];

      // Upload each file and get its public URL
      for (const file of selectedFiles) {
        const filePath = `uploads/${generatedPin}/${file.name}`; // Use the same pin in the file path

        // Upload the file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images') // Make sure this is your bucket name
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading:', uploadError.message);
          throw uploadError;
        }

        // Get the public URL for each uploaded image
        const { data: urlData, error: urlError } = supabase
          .storage
          .from('images') // Same bucket name
          .getPublicUrl(filePath);

        if (urlError) {
          console.error('Error getting public URL:', urlError.message);
          throw urlError;
        }

        uploadedFilePaths.push(urlData.publicUrl); // Add public URL to the list
      }

      // Save the file paths and the PIN to the database
      const { error: dbError } = await supabase.from('image_uploads').insert({
        file_paths: uploadedFilePaths,  // Insert the public URLs into the column
        pin: generatedPin,
      });

      if (dbError) {
        throw dbError;
      }

      setUploadStatus('Upload successful! Your PIN is: ' + generatedPin);
    } catch (error) {
      setUploadStatus('Error uploading files. Please try again.');
    }
  };

  return (
    <div className="send-image-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/filetransfer">File Transfer</Link> / Upload Images
      </nav>

      <h1>Upload Images</h1>
      <p>Select up to 10 images to upload. You'll receive a 4-digit PIN to access them later.</p>

      <input
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.heif,.heic,.webp"
        multiple
        onChange={handleFileSelect}
        className="file-input"
      />

      {selectedFiles.length > 0 && (
        <ul className="file-list">
          {selectedFiles.map((file, index) => (
            <li key={index} className="file-item">{file.name}</li>
          ))}
        </ul>
      )}

      <button onClick={handleUpload} className="upload-button">Upload</button>

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
    </div>
  );
};

export default SendImage;
