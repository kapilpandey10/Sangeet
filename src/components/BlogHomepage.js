import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client for fetching blogs
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaCalendarAlt } from 'react-icons/fa'; // Import Calendar icon for published date
import { Helmet } from 'react-helmet'; // For dynamic SEO meta tags
import '../style/BlogHomepage.css'; // Custom CSS for styling

const BlogHomepage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 10;

  // Fetch only published blogs from Supabase
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, author, excerpt, slug, thumbnail_url, tags, published_date, content')
        .eq('status', 'published'); // Fetch only blogs where status is 'published'
      
      if (error) {
        console.error('Error fetching blogs:', error.message);
      } else {
        setBlogs(data);
        setFilteredBlogs(data); // Initially set filtered blogs to all blogs
      }
      setTimeout(() => setLoading(false), 1500); // 1.5-second delay
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

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const loadMoreBlogs = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  if (loading) {
    return (
      <div className="blog-homepage-container">
        <div className="skeleton-header"></div>
        <div className="skeleton-search-bar"></div>
        <div className="skeleton-blog-grid">
          <div className="skeleton-blog-card"></div>
          <div className="skeleton-blog-card"></div>
          <div className="skeleton-blog-card"></div>
        </div>
        <div className="skeleton-blog-grid">
          <div className="skeleton-blog-card"></div>
          <div className="skeleton-blog-card"></div>
          <div className="skeleton-blog-card"></div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="blog-homepage-container">
      {/* Dynamic SEO with Helmet */}
      <Helmet>
        <title>Latest Blogs - My Blog Site</title>
        <meta name="description" content="Explore the latest blogs on various topics." />
      </Helmet>

      <h1 className="blog-homepage-title">Latest Blogs</h1>

      {/* Search bar */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by title, author, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          list="autocomplete-suggestions"
        />
        <datalist id="autocomplete-suggestions">
          {filteredBlogs.map((blog) => (
            <option key={blog.id} value={blog.title} />
          ))}
        </datalist>
      </div>

      {/* Display recent blogs */}
      <div className="blog-grid-container">
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
            <div className="blog-card" key={blog.id}>
              <img
                className="blog-card-image"
                src={blog.thumbnail_url || 'https://via.placeholder.com/200'}
                alt={blog.title}
                loading="lazy"
              />
              <div className="blog-card-content">
                <h2 className="blog-card-title">{blog.title}</h2>
                <p className="blog-card-author">
                  By {blog.author} | <FaCalendarAlt />{' '}
                  {new Date(blog.published_date).toLocaleDateString()}
                </p>
                <p className="blog-card-excerpt">
                  {blog.excerpt.length > 100 ? `${blog.excerpt.substring(0, 100)}...` : blog.excerpt}
                </p>
                <Link to={`/blogs/${blog.slug}`} className="read-more-button">
                  Read More
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-blogs-message">No blogs available.</p>
        )}
      </div>

      {/* Load More Button */}
      {filteredBlogs.length > currentBlogs.length && (
        <button className="load-more-button" onClick={loadMoreBlogs}>
          Load More
        </button>
      )}
    </div>
  );
};

export default BlogHomepage;
