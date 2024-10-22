import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust the path to your Supabase client
import { useRouter } from 'next/router';
import styles from './style/ManageBlog.module.css';

const ManageBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, slug, published_date, status') // Fetch all blogs with status
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

  const handleEditClick = (slug) => {
    router.push(`/Admin/edit-blog/${slug}`); // Redirect to edit blog page
  };

  return (
    <div className={styles.manageBlogContainer}>
      <h1>Manage Blogs</h1>

      {loading && <p>Loading blogs...</p>}
      {error && <p className={styles.error}>{error}</p>}

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
              onClick={() => handleEditClick(blog.slug)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageBlog;
