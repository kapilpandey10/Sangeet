import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../supabaseClient'; // Adjust the path to your Supabase client
import styles from './style/EditBlog.module.css';

const EditBlog = ({ blogData }) => {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    title: blogData.title || '',
    excerpt: blogData.excerpt || '',
    tags: blogData.tags || '',
    published_date: blogData.published_date || '',
    slug: blogData.slug || '',
    thumbnail_url: blogData.thumbnail_url || '',
    status: blogData.status,
    content: blogData.content || '', // Add content field here
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('blogs')
        .update({
          title: formValues.title,
          excerpt: formValues.excerpt,
          tags: formValues.tags,
          published_date: formValues.published_date,
          slug: formValues.slug,
          thumbnail_url: formValues.thumbnail_url,
          status: formValues.status,
          content: formValues.content, // Save the updated content
        })
        .eq('slug', blogData.slug);

      if (error) throw error;

      setSuccessMessage('Updated Successfully');
    } catch (error) {
      setError('Error updating blog');
      console.error(error);
    }
  };

  const handleOkClick = () => {
    router.push('/Admin'); // Redirect to /admin when 'Ok' is clicked
  };

  const handleCloseClick = () => {
    setSuccessMessage('');
    // Close message and stay on the same page with the form filled up
  };

  return (
    <div className={styles.editBlogContainer}>
      <h1>Edit Blog</h1>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && (
        <div className={styles.successMessage}>
          <p>{successMessage}</p>
          <button onClick={handleCloseClick} className={styles.closeButton}>
            Close
          </button>
          <button onClick={handleOkClick} className={styles.okButton}>
            Ok
          </button>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className={styles.editBlogForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="excerpt">Excerpt:</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows="3"
              value={formValues.excerpt}
              onChange={handleChange}
              required
            />
          </div>
  {/* HTML Content Field */}
  <div className={styles.formGroup}>
            <label htmlFor="content">Content (HTML):</label>
            <textarea
              id="content"
              name="content"
              rows="10"
              value={formValues.content}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (comma separated):</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formValues.tags}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="published_date">Published Date:</label>
            <input
              type="date"
              id="published_date"
              name="published_date"
              value={formValues.published_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug:</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formValues.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="thumbnail_url">Current Thumbnail:</label>
            <div className={styles.thumbnailContainer}>
              {formValues.thumbnail_url ? (
                <img
                  src={formValues.thumbnail_url}
                  alt="Current Thumbnail"
                  className={styles.thumbnailImage}
                />
              ) : (
                <p>No thumbnail uploaded</p>
              )}
            </div>
            <input
              type="text"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formValues.thumbnail_url}
              onChange={handleChange}
              placeholder="Enter Thumbnail URL"
            />
          </div>

          {/* Status Dropdown */}
          <div className={styles.formGroup}>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formValues.status}
              onChange={handleChange}
              required
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

        

          <button type="submit" className={styles.submitButton}>Save Changes</button>
        </form>
      )}
    </div>
  );
};

// Fetch blog data dynamically at request time
export async function getServerSideProps({ params }) {
  const { slug } = params;
  const { data: blogData, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !blogData) {
    return { notFound: true }; // Handle 404 if no blog is found
  }

  return {
    props: {
      blogData, // Pass blog data as props
    },
  };
}

export default EditBlog;
