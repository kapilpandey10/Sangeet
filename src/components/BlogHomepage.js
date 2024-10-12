import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import HotNews from './hotnews';
import '../style/BlogHomepage.css';

const BlogHomepage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('all');
  const blogsPerPage = 10;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, author, excerpt, slug, thumbnail_url, tags, published_date, content')
          .eq('status', 'published')
          .order('published_date', { ascending: false });

        if (error) throw error;

        setBlogs(data);
        setFilteredBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

  useEffect(() => {
    if (selectedTag === 'all') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter((blog) => blog.tags.includes(selectedTag)));
    }
  }, [selectedTag, blogs]);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const loadMoreBlogs = () => setCurrentPage((prevPage) => prevPage + 1);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  useEffect(() => {
    // Initialize Google AdSense
    const loadAdSense = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense failed to load', e);
      }
    };

    loadAdSense(); // Call the function after the component is mounted
  }, []);

  return (
    <div className="blog-homepage-container">
      <Helmet>
        <title>News and Blogs - Sangeet Lyrics Central</title>
        <meta name="description" content="Explore the latest blogs on various topics from Sangeet Lyrics Central." />
        <link rel="canonical" href="https://pandeykapil.com.np/blogs" />
        <meta property="og:title" content="Sangeet Lyrics Central - Blogs" />
        <meta property="og:description" content="Explore the latest blogs on various topics." />
        <meta property="og:url" content="https://pandeykapil.com.np/blogs" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "headline": "Sangeet Lyrics Central - Latest Blogs",
            "url": "https://pandeykapil.com.np/blogs",
            "author": {
              "@type": "Organization",
              "name": "Sangeet Lyrics Central"
            },
            "description": "Explore the latest blogs on various topics from Sangeet Lyrics Central.",
            "publisher": {
              "@type": "Organization",
              "name": "Sangeet Lyrics Central",
              "logo": {
                "@type": "ImageObject",
                "url": "https://pandeykapil.com.np/logo.png"
              }
            }
          })}
        </script>
      </Helmet>

      <h1 className="blog-homepage-title">Latest Blogs</h1>

      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by title, author, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          list="autocomplete-suggestions"
          style={{ color: 'black' }}
          aria-label="Search blogs"
        />
        {searchQuery && (
          <p className="search-results-info">
            {filteredBlogs.length} articles found for "{searchQuery}"
          </p>
        )}
      </div>

      <section className="tag-filter-section">
        <ul className="tag-list" aria-label="Filter by tags">
          <li className={`tag-item ${selectedTag === 'all' ? 'active-tag' : ''}`} onClick={() => handleTagClick('all')}>All</li>
          {allTags.map((tag) => (
            <li key={tag} className={`tag-item ${selectedTag === tag ? 'active-tag' : ''}`} onClick={() => handleTagClick(tag)}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </li>
          ))}
        </ul>
      </section>

      {loading ? (
        <div className="skeleton-container">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="skeleton-card" key={index}></div>
          ))}
        </div>
      ) : (
        <>
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

          {filteredBlogs.length > currentBlogs.length && (
            <button className="load-more-button" onClick={loadMoreBlogs}>
              Load More
            </button>
          )}

          {/* Insert Google Square Ad */}
          <div className="ad-container">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-9887409333966239"
                 data-ad-slot="1039665871"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>

        </>
      )}

      <HotNews />
    </div>
  );
};

export default BlogHomepage;
