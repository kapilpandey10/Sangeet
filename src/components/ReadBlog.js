import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase client for fetching blogs
import DOMPurify from 'dompurify'; // Import DOMPurify to sanitize HTML
import '../style/ReadBlog.css'; // Custom CSS for styling
import { Helmet } from 'react-helmet'; // For dynamic SEO meta tags
import { FaTwitter, FaFacebook } from 'react-icons/fa'; // Import icons from react-icons

const ReadBlog = () => {
  const { slug } = useParams(); // Get the slug from the URL
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog details by slug
  useEffect(() => {
    const fetchBlogBySlug = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single(); // Ensure we get only one result

      if (error) {
        console.error('Error fetching blog:', error.message);
      } else {
        setBlog(data);
        fetchRelatedBlogs(data.tags); // Fetch related blogs based on tags
      }
      setLoading(false);
    };

    fetchBlogBySlug();
  }, [slug]);

  // Fetch related blogs based on tags
  const fetchRelatedBlogs = async (tags) => {
    const { data: blogsWithSameTags, error } = await supabase
      .from('blogs')
      .select('*')
      .contains('tags', tags) // Fetch blogs with the same tags
      .neq('slug', slug) // Exclude the current blog
      .limit(5);

    if (error) {
      console.error('Error fetching related blogs:', error.message);
    }

    if (blogsWithSameTags.length < 5) {
      const { data: randomBlogs, error: randomError } = await supabase
        .from('blogs')
        .select('*')
        .neq('slug', slug) // Exclude the current blog
        .limit(5 - blogsWithSameTags.length); // Fill the rest with random blogs if needed

      if (randomError) {
        console.error('Error fetching random blogs:', randomError.message);
      }

      setRelatedBlogs([...blogsWithSameTags, ...randomBlogs]);
    } else {
      setRelatedBlogs(blogsWithSameTags);
    }
  };

  if (loading) {
    return <div>Loading blog...</div>;
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  // Sanitize the HTML content before rendering
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className="read-blog-container">
      {/* Dynamic SEO with Helmet */}
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt || 'Read our latest blog on important topics'} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
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

          <img
            src={blog.thumbnail_url || 'https://via.placeholder.com/300'}
            alt={blog.title}
            className="blog-image"
            loading="lazy" // Lazy loading for performance
          />

          {/* Render sanitized HTML content */}
          <div
            className="blog-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          ></div>

          {/* Social Sharing Icons */}
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
        <aside className="related-blogs">
          <h3>Suggested Articles</h3>
          <ul className="suggested-list">
            {relatedBlogs.map((relatedBlog) => (
              <li key={relatedBlog.id} className="suggested-item">
                <a href={`/blogs/${relatedBlog.slug}`}>
                  <img src={relatedBlog.thumbnail_url || 'https://via.placeholder.com/150'} alt={relatedBlog.title} className="related-blog-thumbnail" />
                  <div>
                    <h4>{relatedBlog.title}</h4>
                    <p>{relatedBlog.excerpt}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default ReadBlog;
