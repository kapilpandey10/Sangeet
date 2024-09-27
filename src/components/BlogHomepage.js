import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client for fetching blogs
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../style/BlogHomepage.css'; // Custom CSS for styling

const BlogHomepage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  // Fetch only published blogs from Supabase
  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, author, excerpt, slug, thumbnail_url, tags, published_date, content')
        .eq('status', 'Published'); // Fetch only blogs where status is 'published'
      
      if (error) {
        console.error('Error fetching blogs:', error.message);
      } else {
        setBlogs(data);
        setFilteredBlogs(data); // Initially set filtered blogs to all blogs
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  // Handle search query updates
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredBlogs(
      blogs.filter((blog) =>
        blog.title.toLowerCase().includes(lowercasedQuery) ||
        blog.author.toLowerCase().includes(lowercasedQuery) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(lowercasedQuery)) ||
        blog.content.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, blogs]);

  if (loading) {
    return <div className="loading-message">Loading blogs...</div>;
  }

  // Display first 20 blogs and separate the rest into an archive section
  const recentBlogs = filteredBlogs.slice(0, 20);
  const archivedBlogs = filteredBlogs.slice(20);

  return (
    <div className="blog-homepage-container">
      <h1 className="blog-homepage-title">Latest Blogs</h1>

      {/* Search bar */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by title, author, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Display recent blogs */}
      <div className="blog-grid-container">
        {recentBlogs.length > 0 ? (
          recentBlogs.map((blog) => (
            <div className="blog-card" key={blog.id}>
              <img
                className="blog-card-image"
                src={blog.thumbnail_url || 'https://via.placeholder.com/400'}
                alt={blog.title}
              />
              <div className="blog-card-content">
                <h2 className="blog-card-title">{blog.title}</h2>
                <p className="blog-card-author">By {blog.author}</p>
                <p className="blog-card-excerpt">{blog.excerpt}</p>
                <Link to={`/ReadBlog/${blog.slug}`} className="read-more-button">
                  Read More
                </Link>
              </div>
              <p className="blog-card-date">
                Published on: {new Date(blog.published_date).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="no-blogs-message">No blogs available.</p>
        )}
      </div>

      {/* Archive Section */}
      {archivedBlogs.length > 0 && (
        <div className="archive-section">
          <h2>Archive</h2>
          <ul className="archive-list">
            {archivedBlogs.map((blog) => (
              <li key={blog.id}>
                <Link to={`/ReadBlog/${blog.slug}`}>{blog.title} - {blog.author}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogHomepage;
