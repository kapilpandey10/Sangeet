import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import styles from './style/BlogHomepage.module.css';

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

  return (
    <div className={styles.blogHomepageContainer}>
      <Head>
        <title>News and Blogs - Dynabeat</title>
        <meta name="description" content="Explore the latest blogs on various topics from Dynabeat." />
        <link rel="canonical" href="https://pandeykapil.com.np/blogs" />
      </Head>

      <h1 className={styles.blogHomepageTitle}>Latest Blogs</h1>

      <div className={styles.searchBarContainer}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search by title, author, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search blogs"
        />
        {searchQuery && (
          <p className={styles.searchResultsInfo}>
            {filteredBlogs.length} articles found for "{searchQuery}"
          </p>
        )}
      </div>

      <section className={styles.tagFilterSection}>
        <ul className={styles.tagList} aria-label="Filter by tags">
          <li
            className={`${styles.tagItem} ${selectedTag === 'all' ? styles.activeTag : ''}`}
            onClick={() => handleTagClick('all')}
          >
            All
          </li>
          {allTags.map((tag) => (
            <li
              key={tag}
              className={`${styles.tagItem} ${selectedTag === tag ? styles.activeTag : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </li>
          ))}
        </ul>
      </section>

      {loading ? (
        <div className={styles.skeletonContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className={styles.skeletonCard} key={index}></div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.blogGridContainer}>
  {currentBlogs.length > 0 ? (
    currentBlogs.map((blog) => (
      <div className={styles.blogCard} key={blog.id}>
        <img
          className={styles.blogCardImage}
          src={blog.thumbnail_url || 'https://via.placeholder.com/200'}
          alt={`${blog.title} thumbnail`}
        />
        <div className={styles.blogCardContent}>
          {/* Link the title directly to the blog page */}
          <Link href={`/blogs/${blog.slug}`} legacyBehavior>
            <a className={styles.blogCardTitle}>
              <h2>{blog.title}</h2>
            </a>
          </Link>
          <p className={styles.blogCardAuthor}>
            By {blog.author} | {new Date(blog.published_date).toLocaleDateString()}
          </p>
          <p className={styles.blogCardExcerpt}>
            {blog.excerpt.length > 100 ? `${blog.excerpt.substring(0, 100)}...` : blog.excerpt}
          </p>
        </div>
      </div>
    ))
  ) : (
    <p className={styles.noBlogsMessage}>No blogs available.</p>
  )}
</div>


          {filteredBlogs.length > currentBlogs.length && (
            <button className={styles.loadMoreButton} onClick={loadMoreBlogs}>
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default BlogHomepage;
