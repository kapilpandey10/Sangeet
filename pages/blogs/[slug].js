import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';  // For optimized rendering in Next.js
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import styles from './style/ReadBlog.module.css';
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Related Blogs Component
const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  const fetchRelatedBlogs = async () => {
    try {
      if (tags) {
        // Split the tags string by commas into an array
        const tagArray = tags.split(',').map(tag => tag.trim());

        // Build the query pattern for searching related blogs by tags (using ilike for partial match)
        const tagsQuery = tagArray.map(tag => `%${tag}%`);

        // Query for related blogs that match any of the tags (with ilike for flexible search) and are published
        const { data: relatedData, error } = await supabase
          .from('blogs')
          .select('title, slug, thumbnail_url, published_date')
          .neq('slug', slug)  // Exclude the current blog
          .eq('status', 'published')  // Only fetch published blogs
          .or(tagsQuery.map(tag => `tags.ilike.${tag}`).join(','))  // Match any of the tags using ilike
          .limit(7);  // Adjust limit as needed (max 7 blogs)

        if (error) {
          console.error('Error fetching related blogs:', error);
        }

        if (!relatedData || relatedData.length === 0) {
          // Fallback to latest blogs if no related blogs are found
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('blogs')
            .select('title, slug, thumbnail_url, published_date')
            .neq('slug', slug)
            .eq('status', 'published')  // Only fetch published blogs
            .order('published_date', { ascending: false })
            .limit(7);

          if (fallbackError) {
            console.error('Error fetching fallback blogs:', fallbackError);
          }

          setRelatedBlogs(fallbackData || []);
        } else {
          setRelatedBlogs(relatedData);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching related blogs:', err);
    }
  };

  // Trigger fetch when tags change or are available
  useEffect(() => {
    if (tags && tags.length > 0) {
      fetchRelatedBlogs();
    }
  }, [tags]);

  return (
    <aside className={styles.suggestedArticles}>
      <h3>Suggested Articles</h3>
      <ul>
        {relatedBlogs.map((related) => (
          <li key={related.slug} className={styles.relatedArticle}>
            <Link href={`/blogs/${related.slug}`}>
              <Image
                src={related.thumbnail_url || '/default-thumbnail.jpg'}
                alt={related.title}
                width={150}
                height={150}
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
        ))}
      </ul>
    </aside>
  );
};

// Blog Component
const ReadBlog = ({ blog }) => {
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [ogImageDimensions, setOgImageDimensions] = useState({ width: null, height: null });

  useEffect(() => {
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    const getOgImageUrl = () => {
      if (!blog.thumbnail_url) {
        return 'https://pandeykapil.com.np/default-og-image.jpg';
      }

      if (isValidUrl(blog.thumbnail_url)) {
        return blog.thumbnail_url;
      }

      return `https://pandeykapil.com.np${blog.thumbnail_url}`;
    };

    const url = getOgImageUrl();
    setOgImageUrl(url);

    // Use browser's native Image constructor to get image dimensions
    const img = new window.Image();
    img.onload = () => {
      setOgImageDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  }, [blog.thumbnail_url]);

  if (!blog) {
    return (
      <div className={styles.errorContainer}>
        <h2>Blog not found</h2>
        <Link href="/blogs">Back to blogs</Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(blog.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//
  });
  
  const currentUrl = encodeURI(`https://pandeykapil.com.np/blogs/${blog.slug}`);

  // Truncate meta description to avoid breaking words
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className={styles.readBlogContainer}>
      <Head>
        <title>{`${blog.title} - DynaBeats`}</title>
        <meta name="description" content={truncateText(blog.excerpt || `Read about ${blog.title} on DynaBeats Blog`, 155)} />
        <meta name="author" content={blog.author || 'Unknown'} />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph (OG) tags for social media sharing */}
        <meta property="og:title" content={`${blog.title} | DynaBeats Blog`} />
        <meta property="og:description" content={blog.excerpt || `Read about ${blog.title} on DynaBeats Blog`} />
        <meta property="og:image" content={ogImageUrl} />
        {ogImageDimensions.width && ogImageDimensions.height && (
          <>
            <meta property="og:image:width" content={ogImageDimensions.width.toString()} />
            <meta property="og:image:height" content={ogImageDimensions.height.toString()} />
          </>
        )}
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="DynaBeats Blog" />
        <meta property="og:locale" content="en_US" />

        {/* Structured Data - JSON-LD for SEO */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "image": ogImageUrl,
          "author": {
            "@type": "Person",
            "name": blog.author
          },
          "datePublished": blog.published_date,
          "dateModified": blog.updated_date || blog.published_date,
          "description": blog.excerpt,
          "mainEntityOfPage": currentUrl,
          "publisher": {
            "@type": "Organization",
            "name": "DynaBeats",
            "logo": {
              "@type": "ImageObject",
            }
          }
        })}
        </script>
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
              Written by <span>{blog.author || 'Unknown'}</span> on{' '}
              <span>{new Date(blog.published_date).toLocaleDateString()}</span>
            </p>
          </header>

          {ogImageDimensions.width && ogImageDimensions.height && (
            <Image
              src={ogImageUrl}
              alt={blog.title}
              width={ogImageDimensions.width}
              height={ogImageDimensions.height}
              className={styles.blogImage}
              priority
            />
          )}

          <div
            className={styles.blogHtmlContent}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            aria-label="Blog content"
          />

          <div className={styles.socialShare}>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.twitterShare}
            >
              <FaTwitter className={styles.socialIcon} /> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.facebookShare}
            >
              <FaFacebook className={styles.socialIcon} /> Share on Facebook
            </a>
          </div>
        </div>

        <RelatedBlogs tags={blog.tags} slug={blog.slug} />
      </div>
    </div>
  );
};

// Use getStaticPaths to define dynamic routes for SSG
export async function getStaticPaths() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('slug');

  if (error) {
    console.error('Error fetching blog paths:', error);
    return { paths: [], fallback: 'blocking' };
  }

  const paths = blogs.map((blog) => ({
    params: { slug: blog.slug },
  }));

  return { paths, fallback: 'blocking' };
}

// Fetch the blog data at build time
export async function getStaticProps({ params }) {
  const { slug } = params;
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    return {
      notFound: true, // If no blog is found, return a 404
    };
  }

  return {
    props: {
      blog,
    },
    revalidate: 10, // Revalidate the page every 10 seconds (ISR)
  };
}

export default ReadBlog;
