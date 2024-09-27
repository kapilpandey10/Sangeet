import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './style/AddBlog.css'; // Ensure this file exists or create it

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft'); // Default status is 'draft'
  const [content, setContent] = useState(''); // Content will hold the HTML content
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('blogs').insert([
        {
          title,
          author,
          slug,
          excerpt,
          published_date: publishedDate,
          thumbnail_url: thumbnailUrl,
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
        setThumbnailUrl('');
        setTags('');
        setContent(''); // Clear content
        setStatus('draft');
      }
    } catch (error) {
      setErrorMessage('An error occurred while adding the blog.');
      setSuccessMessage(null);
    }
  };

  return (
    <div className="add-blog-container">
      <h2 className="add-blog-title">Add New Blog</h2>
      <form className="add-blog-form" onSubmit={handleSubmit}>
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

        <label>Thumbnail URL (Optional):</label>
        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />

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

        <button type="submit">Add Blog</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
};

export default AddBlog;
