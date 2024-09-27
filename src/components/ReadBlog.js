import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase client for fetching blogs
import DOMPurify from 'dompurify'; // Import DOMPurify to sanitize HTML
import '../style/ReadBlog.css'; // Custom CSS for styling

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
        />
        {/* Render sanitized HTML content */}
        <div
          className="blog-html-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
      </div>

      {/* Suggested Articles */}
      <aside className="related-blogs">
        <h3>Suggested Articles</h3>
        <ul className="suggested-list">
          {relatedBlogs.map((relatedBlog) => (
            <li key={relatedBlog.id} className="suggested-item">
              <a href={`/ReadBlog/${relatedBlog.slug}`}>
                <h4>{relatedBlog.title}</h4>
                <p>{relatedBlog.excerpt}</p>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default ReadBlog;
