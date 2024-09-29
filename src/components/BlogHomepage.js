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
  const [selectedTag, setSelectedTag] = useState('all');
  const blogsPerPage = 10;

  // Fetch only published blogs from Supabase and order by latest
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, author, excerpt, slug, thumbnail_url, tags, published_date, content')
        .eq('status', 'published')
        .order('published_date', { ascending: false }); // Order by published_date in descending order

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

  // Filter blogs by selected tag
  useEffect(() => {
    if (selectedTag === 'all') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(
        blogs.filter((blog) => blog.tags.includes(selectedTag))
      );
    }
  }, [selectedTag, blogs]);

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const loadMoreBlogs = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Handle tag click
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1); // Reset pagination to first page
  };

  // Dynamically generate tags from the blog data
  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  return (
    <div className="blog-homepage-container">
      {/* Dynamic SEO with Helmet */}
      <Helmet>
        <title>Latest Blogs - My Blog Site</title>
        <meta name="description" content="Explore the latest blogs on various topics from Sangeet Lyrics Central." />
        <link rel="canonical" href="https://pandeykapil.com.np/blogs" />
        <meta property="og:title" content="Sangeet Lyrics Central - Blogs" />
        <meta property="og:description" content="Explore the latest blogs on various topics." />
        <meta property="og:url" content="https://pandeykapil.com.np/blogs" />
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
          style={{ color: 'black' }} // Set the input text color to black
        />
        {searchQuery && (
          <p className="search-results-info">
            {filteredBlogs.length} articles found for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Tag Filter Section */}
      <section className="tag-filter-section">
        <ul className="tag-list">
          <li className={`tag-item ${selectedTag === 'all' ? 'active-tag' : ''}`} onClick={() => handleTagClick('all')}>All</li>
          {allTags.map((tag) => (
            <li key={tag} className={`tag-item ${selectedTag === tag ? 'active-tag' : ''}`} onClick={() => handleTagClick(tag)}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)} {/* Capitalize the tag */}
            </li>
          ))}
        </ul>
      </section>

      {/* Display recent blogs */}
      <div className="blog-grid-container">
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
            <div className="blog-card" key={blog.id}>
              <img
                className="blog-card-image"
                src={blog.thumbnail_url || 'https://via.placeholder.com/200'}
                alt={`${blog.title} thumbnail`}
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
