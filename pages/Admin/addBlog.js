import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Styles from './style/AddBlog.module.css'; // Corrected the import statement for CSS module

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [imageFile, setImageFile] = useState(null); // File input state for image upload
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft'); // Default status is 'draft'
  const [content, setContent] = useState(''); // Content will hold the HTML content
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading animation

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Function to upload image to Supabase storage and return the public URL
  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileName = `${slug}-${Date.now()}`; // Use slug and timestamp to create a unique file name
    const filePath = `thumbnails/${fileName}`;

    // Upload the image to Supabase storage
    const { data, error } = await supabase.storage
      .from('images') // Replace with your Supabase storage bucket name
      .upload(filePath, imageFile);

    if (error) {
      throw new Error('Image upload failed: ' + error.message);
    }

    // Get the public URL for the uploaded image
    const { data: urlData, error: urlError } = supabase
      .storage
      .from('images') // Replace with your Supabase storage bucket name
      .getPublicUrl(filePath);

    if (urlError) {
      throw new Error('Error getting public URL: ' + urlError.message);
    }

    return urlData.publicUrl; // Return the public URL of the image
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true); // Start loading animation

    try {
      // Upload the image and get the public URL if an image is selected
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(); // Upload the image and get the full public URL
      }

      // Insert blog details into the blogs table, including the thumbnail URL
      const { data, error } = await supabase.from('blogs').insert([
        {
          title,
          author,
          slug,
          excerpt,
          published_date: publishedDate,
          thumbnail_url: imageUrl, // Store the uploaded image URL in the thumbnail_url column
          content, // Insert HTML content as a string
          status,
          tags: tags.split(','), // Split tags by comma
        },
      ]);

      if (error) {
        setErrorMessage('Error uploading blog: ' + error.message);
        setSuccessMessage(null);
      } else {
        setSuccessMessage('Blog added successfully!');
        setErrorMessage(null);

        // Optionally, reset form fields after successful submission
        setTitle('');
        setAuthor('');
        setSlug('');
        setExcerpt('');
        setPublishedDate('');
        setTags('');
        setContent(''); // Clear content
        setStatus('draft');
        setImageFile(null); // Clear the image file
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while adding the blog.');
      setSuccessMessage(null);
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className={Styles.addBlogContainer}> {/* Use CSS module class */}
      <h2 className={Styles.addBlogTitle}>Add New Blog</h2>
      <form className={Styles.addBlogForm} onSubmit={handleSubmit}> {/* Applied correct class names */}
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Author:</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <label>Slug (URL-friendly):</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <label>Excerpt (Optional):</label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <label>Published Date (Optional):</label>
        <input
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
        />

        {/* Image Upload Section */}
        <label>Thumbnail Image (Optional):</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileSelect}
        />
        {imageFile && <p>Selected file: {imageFile.name}</p>}

        <label>Tags (comma-separated):</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <label>HTML Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your blog content in HTML format here..."
          rows="10"
          required
        />

        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading Blog...' : 'Add Blog'}
        </button>

        {/* Loading animation or message */}
        {loading && (
          <div className={Styles.loadingAnimation}> {/* Applied proper className */}
            <div className={Styles.spinner}></div>
            <p>Uploading blog...</p>
          </div>
        )}

        {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>} {/* Applied proper className */}
        {successMessage && <p className={Styles.successMessage}>{successMessage}</p>} {/* Applied proper className */}
      </form>
    </div>
  );
};

export default AddBlog;
