import React, { Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import '../style/ReadBlog.css';
import { Helmet } from 'react-helmet'; // For SEO
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Lazy load the RelatedBlogs component
const RelatedBlogs = React.lazy(() => import('./RelatedBlog'));

const ReadBlog = () => {
  const { slug } = useParams(); // Extract slug from URL params
  const [blog, setBlog] = useState(null); // Blog content
  const [relatedBlogs, setRelatedBlogs] = useState([]); // Related blog articles
  const [loading, setLoading] = useState(true); // Loading state
  const [currentUrl, setCurrentUrl] = useState('');

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
      } else {
        setBlog(blogData);
        if (blogData.tags && blogData.tags.length > 0) {
          fetchRelatedBlogs(blogData.tags);
        } else {
          // Fetch other blogs if no tags available
          fetchFallbackBlogs();
        }
      }
      setLoading(false);
    };

    // Fetch related blog articles based on tags
    const fetchRelatedBlogs = async (tags) => {
      console.log('Tags for related blogs:', tags); // Debugging tags
      const { data: relatedData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date') // Added thumbnail_url and published_date
        .not('slug', 'eq', slug) // Exclude the current blog
        .ilike('tags', `%${tags.join('%')}%`) // Match tags, ensure correct format
        .limit(5);

      if (error || relatedData.length === 0) {
        console.warn('No related articles found by tags, fetching fallback blogs...');
        fetchFallbackBlogs(); // Fetch fallback blogs if no related blogs by tags
      } else {
        console.log('Related articles:', relatedData); // Debugging related blogs
        setRelatedBlogs(relatedData);
      }
    };

  
    
    // Fallback: Fetch any other recent blogs
    const fetchFallbackBlogs = async () => {
      const { data: fallbackData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date') // Added thumbnail_url and published_date
        .not('slug', 'eq', slug) // Exclude the current blog
        .order('published_date', { ascending: false }) // Fetch the latest blogs
        .limit(5);

      if (error) {
        console.error('Error fetching fallback blogs:', error.message);
      } else {
        console.log('Fallback articles:', fallbackData); // Debugging fallback blogs
        setRelatedBlogs(fallbackData);
      }
    };

    fetchBlogBySlug();
  }, [slug]);

  // Stick suggested articles to top after scrolling
  useEffect(() => {
    const handleScroll = () => {
      const suggestedSection = document.querySelector('.suggested-articles');
      const scrollPosition = window.scrollY;

      if (suggestedSection) {
        if (scrollPosition > 300) {
          suggestedSection.classList.add('sticky');
        } else {
          suggestedSection.classList.remove('sticky');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="read-blog-container">
        {/* Skeleton loaders for UX */}
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

  // Sanitize the blog content
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className="read-blog-container">
      {/* SEO Meta Tags */}
      <Helmet>
  <title>{blog.title}</title>
  <meta name="description" content={blog.excerpt || 'Read our latest blog on important topics'} />
  <meta name="keywords" content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`} />
  <meta name="author" content={blog.author} />

  {/* Open Graph Tags */}
  <meta property="og:title" content={blog.title} />
  <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'} />
  <meta property="og:image" content={blog.thumbnail_url } />
  <meta property="og:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
  <meta property="og:type" content="article" />

  <link rel="canonical" href={`https://pandeykapil.com.np/blogs/${slug}`} />


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

      {/* Breadcrumb always at top */}
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

          {/* Google Auto Ads Integration */}
          <div className="ad-space" id="google-ads-container"></div>

          {/* Social Share */}
          <div className="social-share">
            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="twitter-share"
            >
              <FaTwitter className="social-icon" /> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-share"
            >
              <FaFacebook className="social-icon" /> Share on Facebook
            </a>
          </div>
        </div>

        {/* Suggested Articles */}
        <aside className="suggested-articles">
          <h3>Suggested Articles</h3>
          <Suspense fallback={<div>Loading related articles...</div>}>
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
          </Suspense>
        </aside>
      </div>
    </div>
  );
};

export default ReadBlog;
