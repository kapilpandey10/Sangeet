import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust the path to your Supabase client
import { FaTrash } from 'react-icons/fa'; // Import trash icon for delete
import styles from './style/ManageBlog.module.css';

const ManageBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Success message
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedSlug, setUpdatedSlug] = useState('');
  const [updatedContent, setUpdatedContent] = useState(''); // Set the content here
  const [updatedPublishedDate, setUpdatedPublishedDate] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedExcerpt, setUpdatedExcerpt] = useState('');
  const [updatedThumbnailUrl, setUpdatedThumbnailUrl] = useState('');
  const [updatedTags, setUpdatedTags] = useState('');
  const [updatedAuthor, setUpdatedAuthor] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, slug, content, published_date, status, excerpt, thumbnail_url, tags, author') // Make sure 'content' is being selected
          .order('published_date', { ascending: false });

        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        setError('Error fetching blogs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleUpdateBlog = async () => {
    if (!updatedTitle || !updatedSlug || !updatedContent || !updatedAuthor) {
      setError('Please fill in all fields before submitting.');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      const { error } = await supabase
        .from('blogs')
        .update({
          title: updatedTitle,
          slug: updatedSlug,
          content: updatedContent, // Ensure content is updated
          published_date: updatedPublishedDate,
          status: updatedStatus,
          excerpt: updatedExcerpt,
          thumbnail_url: updatedThumbnailUrl,
          tags: updatedTags,
          author: updatedAuthor,
        })
        .eq('id', selectedBlog.id);

      if (error) throw error;

      setSuccessMessage('Blog updated successfully!');
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === selectedBlog.id
            ? {
                ...blog,
                title: updatedTitle,
                slug: updatedSlug,
                content: updatedContent, // Update content here as well
                published_date: updatedPublishedDate,
                status: updatedStatus,
                excerpt: updatedExcerpt,
                thumbnail_url: updatedThumbnailUrl,
                tags: updatedTags,
                author: updatedAuthor,
              }
            : blog
        )
      );

      setIsEditing(false);
      setSelectedBlog(null);
    } catch (error) {
      setError('Error updating blog. Please try again.');
      console.error('Error updating blog:', error);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', blogId);
      if (error) throw error;

      // Remove the deleted blog from the state
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
      setSuccessMessage('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Error deleting blog. Please try again.');
    }
  };

  const handleEditClick = (blog) => {
    setSelectedBlog(blog);
    setUpdatedTitle(blog.title);
    setUpdatedSlug(blog.slug);
    setUpdatedContent(blog.content); // Set the content for editing
    setUpdatedPublishedDate(blog.published_date);
    setUpdatedStatus(blog.status);
    setUpdatedExcerpt(blog.excerpt);
    setUpdatedThumbnailUrl(blog.thumbnail_url);
    setUpdatedTags(blog.tags);
    setUpdatedAuthor(blog.author);
    setIsEditing(true);
  };

  const toggleBlogStatus = async (blogId, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ status: newStatus })
        .eq('id', blogId);

      if (error) throw error;

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, status: newStatus } : blog
        )
      );
    } catch (error) {
      console.error('Error updating blog status:', error);
    }
  };

  return (
    <div className={styles.manageBlogContainer}>
      <h1>Manage Blogs</h1>

      {loading && <p>Loading blogs...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      {!loading && blogs.length === 0 && <p>No blogs available.</p>}

      <ul className={styles.blogList}>
        {blogs.map((blog) => (
          <li
            key={blog.id}
            className={`${styles.blogItem} ${blog.status === 'published' ? styles.published : styles.draft}`}
          >
            <h3>{blog.title}</h3>
            <p className={styles.blogDate}>
              {blog.status === 'published' ? 'Published' : 'Drafted'} on {new Date(blog.published_date).toLocaleDateString()}
            </p>
            <button
              className={styles.editButton}
              onClick={() => handleEditClick(blog)}
            >
              Edit
            </button>
            <button
              className={styles.toggleStatusButton}
              onClick={() => toggleBlogStatus(blog.id, blog.status)}
            >
              {blog.status === 'draft' ? 'Publish' : 'Set to Draft'}
            </button>

            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteBlog(blog.id)}
            >
              <FaTrash /> Delete
            </button>
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className={styles.overlay}>
          <div className={styles.editFormContainer}>
            <h2>Edit Blog</h2>
            <label className={styles.label}>Title:</label>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Slug:</label>
            <input
              type="text"
              value={updatedSlug}
              onChange={(e) => setUpdatedSlug(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Content:</label>
            <textarea
              value={updatedContent} // Pre-fill the content here
              onChange={(e) => setUpdatedContent(e.target.value)}
              className={styles.textarea}
              rows="6"
            />
            <label className={styles.label}>Published Date:</label>
            <input
              type="date"
              value={updatedPublishedDate}
              onChange={(e) => setUpdatedPublishedDate(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Excerpt:</label>
            <input
              type="text"
              value={updatedExcerpt}
              onChange={(e) => setUpdatedExcerpt(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Thumbnail URL:</label>
            <input
              type="text"
              value={updatedThumbnailUrl}
              onChange={(e) => setUpdatedThumbnailUrl(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Tags:</label>
            <input
              type="text"
              value={updatedTags}
              onChange={(e) => setUpdatedTags(e.target.value)}
              className={styles.input}
            />
            <label className={styles.label}>Author:</label>
            <input
              type="text"
              value={updatedAuthor}
              onChange={(e) => setUpdatedAuthor(e.target.value)}
              className={styles.input}
            />
            <div className={styles.buttonGroup}>
              <button onClick={handleUpdateBlog} className={styles.saveButton}>
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;
