import React, { Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import '../style/ReadBlog.css';
import { Helmet } from 'react-helmet'; // For SEO
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Code Splitting: Lazy load related blogs
const RelatedBlogs = React.lazy(() => import('./RelatedBlog'));

const ReadBlog = () => {
  const { slug } = useParams(); // Get the slug from the URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blog details by slug
  useEffect(() => {
    const fetchBlogBySlug = async () => {
      setLoading(true); // Loading starts immediately
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog:', error.message);
      } else {
        setBlog(data);
      }
      setLoading(false); // Set loading to false once the blog data is fetched
    };

    fetchBlogBySlug();
  }, [slug]);

  if (loading) {
    return (
      <div className="read-blog-container">
        {/* Skeleton loaders */}
        <div className="skeleton-header"></div>
        <div className="skeleton-paragraph"></div>
        <div className="skeleton-paragraph"></div>
        <div className="skeleton-image"></div>
      </div>
    );
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  // Sanitize the HTML content before rendering
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className="read-blog-container">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt || 'Read our latest blog on important topics'} />
        <meta name="keywords" content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`} />
        <meta name="author" content={blog.author} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta property="og:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
        <meta property="og:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta name="twitter:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
        <meta name="twitter:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
        <link rel="canonical" href={`https://pandeykapil.com.np/blogs/${slug}`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "image": blog.thumbnail_url || 'https://via.placeholder.com/300',
            "author": {
              "@type": "Person",
              "name": blog.author
            },
            "datePublished": blog.published_date,
            "publisher": {
              "@type": "Organization",
              "name": "Sangeet Lyrics Central",
              "logo": {
                "@type": "ImageObject",
                "url": "https://pandeykapil.com.np/logo.png"
              }
            },
            "description": blog.excerpt || 'Read our latest blog on important topics',
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://pandeykapil.com.np/blogs/${slug}`
            }
          })}
        </script>
      </Helmet>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/blogs">Blogs</Link> / {blog.title}
      </nav>

      {/* Blog Content */}
      <div className="blog-layout">
        <div className="blog-content">
          <header className="blog-header">
            <h1>{blog.title}</h1>
            <p className="blog-meta">
              Written by <span>{blog.author}</span> on{' '}
              <span>{new Date(blog.published_date).toLocaleDateString()}</span>
            </p>
          </header>

          {/* Lazy Load Image */}
          <img
            src={blog.thumbnail_url || 'https://via.placeholder.com/300'}
            alt={blog.title}
            className="blog-image"
            loading="lazy"
          />

          {/* Render sanitized HTML content */}
          <div
            className="blog-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            aria-label="Blog content"
          ></div>

          {/* Social Sharing Icons */}
          <div className="social-share" aria-label="Share this blog">
            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
              className="twitter-share"
            >
              <FaTwitter className="social-icon" /> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
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
    </div>
  );
};

export default ReadBlog;
