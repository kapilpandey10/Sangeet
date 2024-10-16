import React, { Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import '../style/ReadBlog.css';
import { Helmet } from 'react-helmet'; // For SEO
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Related Blogs Component (Lazy-loaded)
const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      const { data: relatedData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date')
        .not('slug', 'eq', slug) // Exclude current blog
        .ilike('tags', `%${tags.join('%')}%`) // Match tags
        .limit(5);

      if (error || relatedData.length === 0) {
        // Fetch fallback blogs if no related blogs found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('blogs')
          .select('title, slug, thumbnail_url, published_date')
          .not('slug', 'eq', slug)
          .order('published_date', { ascending: false })
          .limit(5);
        if (!fallbackError) setRelatedBlogs(fallbackData);
      } else {
        setRelatedBlogs(relatedData);
      }
    };
    if (tags && tags.length > 0) {
      fetchRelatedBlogs();
    }
  }, [tags, slug]);

  return (
    <aside className="suggested-articles">
      <h3>Suggested Articles</h3>
      <ul>
        {relatedBlogs.length > 0 ? (
          relatedBlogs.map((related) => (
            <li key={related.slug} className="related-article">
              <Link to={`/blogs/${related.slug}`}>
                <img
                  src={related.thumbnail_url || 'https://via.placeholder.com/150'}
                  alt={related.title}
                  className="related-article-thumbnail"
                />
                <div className="related-article-info">
                  <h4>{related.title}</h4>
                  <p className="related-article-date">
                    {new Date(related.published_date).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))
        ) : (
          <li>No related articles found.</li>
        )}
      </ul>
    </aside>
  );
};

const ReadBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  // Set current URL for sharing
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Fetch blog details by slug
  useEffect(() => {
    const fetchBlogBySlug = async () => {
      setLoading(true);
      const { data: blogData, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog:', error.message);
        setBlog(null);
      } else {
        setBlog(blogData);
      }
      setLoading(false);
    };
    fetchBlogBySlug();
  }, [slug]);

  // Initialize Google Auto Ads
  useEffect(() => {
    const initializeAds = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', 'ca-pub-9887409333966239');
      document.body.appendChild(script);
    };

    initializeAds();
  }, []);

  if (loading) {
    return (
      <div className="read-blog-container">
        {/* Skeleton Loaders */}
        <div className="skeleton-header"></div>
        <div className="skeleton-paragraph"></div>
        <div className="skeleton-paragraph"></div>
        <div className="skeleton-image"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="error-container">
        <h2>Blog not found</h2>
        <Link to="/blogs">Back to blogs</Link>
      </div>
    );
  }

  // Sanitize blog content to avoid XSS attacks
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className="read-blog-container">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.title}</title>
        <meta
          name="description"
          content={blog.excerpt || 'Read this blog post on important topics'}
        />
        <meta
          name="keywords"
          content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`}
        />
        <meta name="author" content={blog.author} />
        <link rel="canonical" href={`https://pandeykapil.com.np/blogs/${slug}`} />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'}/>
        <meta property="og:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
        <meta property="og:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
        <meta property="og:type" content="article" />
      </Helmet>
 
  

      {/* Breadcrumb for navigation */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/blogs">Blogs</Link> / {blog.title}
      </nav>

      {/* Blog Layout */}
      <div className="blog-layout">
        <div className="blog-content">
          {/* Blog Header */}
          <header className="blog-header">
            <h1>{blog.title}</h1>
            <p className="blog-meta">
              Written by <span>{blog.author}</span> on{' '}
              <span>{new Date(blog.published_date).toLocaleDateString()}</span>
            </p>
          </header>

          {/* Blog Image */}
          <img
            src={blog.thumbnail_url || 'https://via.placeholder.com/300'}
            alt={blog.title}
            className="blog-image"
            loading="lazy"
          />

          {/* Blog HTML Content */}
          <div
            className="blog-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            aria-label="Blog content"
          ></div>

          {/* Social Share Buttons */}
          <div className="social-share">
            <a
              href={`https://twitter.com/intent/tweet?url=${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="twitter-share"
            >
              <FaTwitter className="social-icon" /> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-share"
            >
              <FaFacebook className="social-icon" /> Share on Facebook
            </a>
          </div>
        </div>

        {/* Suggested Articles */}
        <Suspense fallback={<div>Loading related articles...</div>}>
          <RelatedBlogs tags={blog.tags} slug={slug} />
        </Suspense>
      </div>

      {/* Google Ads Integration */}
      <div className="google-ads">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="3428921840"
          data-ad-format="autorelaxed"
        ></ins>
      </div>
    </div>
  );
};

export default ReadBlog;
