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

    const fetchRelatedBlogs = async (tags) => {
      console.log('Tags for related blogs:', tags); 
      const { data: relatedData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date')
        .not('slug', 'eq', slug) 
        .ilike('tags', `%${tags.join('%')}%`) 
        .limit(5);

      if (error || relatedData.length === 0) {
        console.warn('No related articles found by tags, fetching fallback blogs...');
        fetchFallbackBlogs();
      } else {
        console.log('Related articles:', relatedData); 
        setRelatedBlogs(relatedData);
      }
    };

    const fetchFallbackBlogs = async () => {
      const { data: fallbackData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date')
        .not('slug', 'eq', slug)
        .order('published_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching fallback blogs:', error.message);
      } else {
        console.log('Fallback articles:', fallbackData); 
        setRelatedBlogs(fallbackData);
      }
    };

    fetchBlogBySlug();
  }, [slug]);

  if (loading) {
    return (
      <div className="read-blog-container">
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
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt || 'Read our latest blog on important topics'} />
        <meta name="keywords" content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`} />
        <meta name="author" content={blog.author} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta property="og:image" content={blog.thumbnail_url} />
        <meta property="og:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://pandeykapil.com.np/blogs/${slug}`} />
      </Helmet>

      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/blogs">Blogs</Link> / {blog.title}
      </nav>

      <div className="blog-layout">
        <div className="blog-content">
          <header className="blog-header">
            <h1>{blog.title}</h1>
            <p className="blog-meta">
              Written by <span>{blog.author}</span> on{' '}
              <span>{new Date(blog.published_date).toLocaleDateString()}</span>
            </p>
          </header>

          <img
            src={blog.thumbnail_url || 'https://via.placeholder.com/300'}
            alt={blog.title}
            className="blog-image"
            loading="lazy"
          />

          <div
            className="blog-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            aria-label="Blog content"
          ></div>

          {/* Google Auto Ads Integration */}
          <div className="ad-space">
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9887409333966239"
              data-ad-slot="4756859110"
              data-ad-format="auto"
              data-full-width-responsive="true"></ins>
            <script>
              {(window.adsbygoogle = window.adsbygoogle || []).push({})}
            </script>
          </div>

          <div className="social-share">
            <a href={`https://twitter.com/intent/tweet?url=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="twitter-share">
              <FaTwitter className="social-icon" /> Share on Twitter
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="facebook-share">
              <FaFacebook className="social-icon" /> Share on Facebook
            </a>
          </div>
        </div>

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
