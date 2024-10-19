import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js Router
import Link from 'next/link'; // Import Link from Next.js
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import styles from './style/ReadBlog.module.css'; // Adjust to your CSS path
import Head from 'next/head'; // Use next/head for SEO
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Related Blogs Component
const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      const { data: relatedData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date')
        .neq('slug', slug) // Exclude current blog
        .ilike('tags', `%${tags.join('%')}%`) // Match tags
        .limit(5);

      if (error || relatedData.length === 0) {
        // Fetch fallback blogs if no related blogs found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('blogs')
          .select('title, slug, thumbnail_url, published_date')
          .neq('slug', slug)
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
    <aside className={styles.suggestedArticles}>
      <h3>Suggested Articles</h3>
      <ul>
        {relatedBlogs.length > 0 ? (
          relatedBlogs.map((related) => (
            <li key={related.slug} className={styles.relatedArticle}>
              <Link href={`/blogs/${related.slug}`}>
                <img
                  src={related.thumbnail_url || 'https://via.placeholder.com/150'}
                  alt={related.title}
                  className={styles.relatedArticleThumbnail}
                />
                <div className={styles.relatedArticleInfo}>
                  <h4>{related.title}</h4>
                  <p className={styles.relatedArticleDate}>
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
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href); // Set the current page URL for social sharing
  }, []);

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
    if (slug) {
      fetchBlogBySlug();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.readBlogContainer}>
        {/* Skeleton Loaders */}
        <div className={styles.skeletonHeader}></div>
        <div className={styles.skeletonParagraph}></div>
        <div className={styles.skeletonParagraph}></div>
        <div className={styles.skeletonImage}></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.errorContainer}>
        <h2>Blog not found</h2>
        <Link href="/blogs">Back to blogs</Link>
      </div>
    );
  }

  // Sanitize blog content
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className={styles.readBlogContainer}>
      {/* SEO Metadata */}
      <Head>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta name="keywords" content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`} />
        <meta name="author" content={blog.author} />
        <link rel="canonical" href={`https://pandeykapil.com.np/blogs/${slug}`} />

        {/* Open Graph (OG) tags for social media sharing */}
        <meta property="og:title" content={blog.title || 'PandeyKapil Blog'} />
        <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta property="og:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
        <meta property="og:url" content={`https://pandeykapil.com.np/blogs/${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="PandeyKapil Blogs" />

        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title || 'PandeyKapil Blog'} />
        <meta name="twitter:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta name="twitter:image" content={blog.thumbnail_url || 'https://via.placeholder.com/300'} />
      </Head>

      {/* Blog Content */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/">Home</Link> / <Link href="/blogs">Blogs</Link> / {blog.title}
      </nav>

      <div className={styles.blogLayout}>
        <div className={styles.blogContent}>
          <header className={styles.blogHeader}>
            <h1>{blog.title}</h1>
            <p className={styles.blogMeta}>
              Written by <span>{blog.author}</span> on{' '}
              <span>{new Date(blog.published_date).toLocaleDateString()}</span>
            </p>
          </header>

          <img
            src={blog.thumbnail_url || 'https://via.placeholder.com/300'}
            alt={blog.title}
            className={styles.blogImage}
            loading="lazy"
          />

          <div
            className={styles.blogHtmlContent}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            aria-label="Blog content"
          ></div>

          <div className={styles.socialShare}>
            <a
              href={`https://twitter.com/intent/tweet?url=${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.twitterShare}
            >
              <FaTwitter className={styles.socialIcon} /> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.facebookShare}
            >
              <FaFacebook className={styles.socialIcon} /> Share on Facebook
            </a>
          </div>
        </div>

        <Suspense fallback={<div>Loading related articles...</div>}>
          <RelatedBlogs tags={blog.tags} slug={slug} />
        </Suspense>
      </div>

      <div className={styles.googleAds}>
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
