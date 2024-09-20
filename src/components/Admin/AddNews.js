// File: src/components/Admin/AddNews.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Import your Supabase client
import { useNavigate } from 'react-router-dom';
import Quill from 'react-quill'; // Rich text editor
import 'react-quill/dist/quill.snow.css'; // Quill's CSS
import './style/AddNews.css'; // Custom CSS for styling

const AddNews = () => {
  const [title, setTitle] = useState('');
  const [newsBody, setNewsBody] = useState(''); // Rich text content
  const [addedBy, setAddedBy] = useState('Admin'); // Default author name
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle screen size, restrict access on mobile devices
  useEffect(() => {
    const isTabletOrLaptop = window.innerWidth > 768;
    if (!isTabletOrLaptop) {
      navigate('/admin', { replace: true });
      alert('Please use a tablet or computer screen to access this page.');
    }
  }, [navigate]);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !newsBody || !addedBy) {
      setStatus('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      // Insert data into the news table
      const { error } = await supabase
        .from('news') // Replace 'news' with your Supabase table name
        .insert([
          {
            title,
            news_content: newsBody, // Rich text content
            added_by: addedBy, // The author/admin who added the news
            created_at: new Date(), // Automatically set timestamp
          },
        ]);

      if (error) throw error;

      // Reset form on successful submission
      setStatus('News added successfully!');
      setTitle('');
      setNewsBody('');
    } catch (error) {
      console.error('Error adding news:', error.message);
      setStatus('Error adding news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-news-container">
      <h1>Add News</h1>
      {status && <p>{status}</p>}
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter news title"
          className="input-large"
          required
        />

        {/* News Content */}
        <label>News Content:</label>
        <Quill
          value={newsBody}
          onChange={setNewsBody}
          theme="snow" // Use the Quill 'snow' theme for rich text editor
          placeholder="Write your news content here..."
          className="editor-large" // Add custom style for large editor
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'color': [] }], // Include color options in the toolbar
              ['link', 'image'],
            ],
          }}
        />

        {/* Added By (Author) */}
        <label>Added By:</label>
        <input
          type="text"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
          placeholder="Enter your name"
          className="input-large"
          required
        />

        {/* Submit Button */}
        <button type="Publish Now" disabled={loading}>
          {loading ? 'Publish now...' : 'Published'}
        </button>
      </form>
    </div>
  );
};

export default AddNews;
