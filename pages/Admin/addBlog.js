import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Styles from './style/AddBlog.module.css'; // Import your CSS module for styles

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [imageFile, setImageFile] = useState(null); // For image upload
  const [selectedTag, setSelectedTag] = useState(''); // Single tag selection (empty by default)
  const [status, setStatus] = useState('draft'); // Default status
  const [content, setContent] = useState(''); // Blog content
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default published date to today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    setPublishedDate(today);
  }, []);

  // Common news categories for the dropdown
  const commonTags = [
    'Politics', 'Business', 'Technology', 'Health', 'Science',
    'Sports', 'Entertainment', 'World', 'Environment', 'Lifestyle',
    'Education', 'Opinion', 'Crime', 'Weather', 'Local'
  ];

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Function to upload image to Supabase storage and return the public URL
  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileName = `${slug}-${Date.now()}`;
    const filePath = `thumbnails/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, imageFile);

    if (error) {
      throw new Error('Image upload failed: ' + error.message);
    }

    const { data: urlData, error: urlError } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);

    if (urlError) {
      throw new Error('Error getting public URL: ' + urlError.message);
    }

    return urlData.publicUrl;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const { data, error } = await supabase.from('blogs').insert([
        {
          title,
          author,
          slug,
          excerpt,
          published_date: publishedDate,
          thumbnail_url: imageUrl,
          content,
          status,
          tags: selectedTag, // Save the selected tag
        },
      ]);

      if (error) {
        setErrorMessage('Error uploading blog: ' + error.message);
      } else {
        setSuccessMessage('Blog added successfully!');
        resetForm();
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while adding the blog.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form after successful submission
  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setSlug('');
    setExcerpt('');
    setPublishedDate('');
    setSelectedTag(''); // Clear selected tag
    setContent('');
    setStatus('draft');
    setImageFile(null); // Clear image file
  };

  return (
    <div className={Styles.addBlogContainer}>
      <h2 className={Styles.addBlogTitle}>Add New Blog</h2>
      <form className={Styles.addBlogForm} onSubmit={handleSubmit}>
        {/* Other form fields */}
        
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

        <label>Excerpt:</label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
        />

        <label>Published Date:</label>
        <input
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
          required
        />

        {/* Image Upload Section */}
        <label>Thumbnail Image:</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileSelect}
          required
        />
        {imageFile && <p>Selected file: {imageFile.name}</p>}

        {/* Tags (Dropdown) */}
        <label>Tags:</label>
        <select
          className={Styles.selectTag}
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          required
        >
          <option value="">Select a tag</option>
          {commonTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

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

        {loading && (
          <div className={Styles.loadingAnimation}>
            <div className={Styles.spinner}></div>
            <p>Uploading blog...</p>
          </div>
        )}

        {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={Styles.successMessage}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default AddBlog;