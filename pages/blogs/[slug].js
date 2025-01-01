// pages/blogs/[slug].js
// -------------------------------------------------------------------
// FULLY UPDATED VERSION WITH IMPROVED SEO, MODERN LINK USAGE,
// RESPONSIVE BEST PRACTICES, AND CONSOLE.LOG MESSAGES
// -------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import styles from './style/ReadBlog.module.css';
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// -------------------------------------------------------------------
// COMPONENT: RelatedBlogs
// This component fetches and displays related articles based on tags.
// -------------------------------------------------------------------
const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  // -------------------------------------------------------------------
  // fetchRelatedBlogs: Queries Supabase for related/published blogs.
  // -------------------------------------------------------------------
  const fetchRelatedBlogs = async () => {
    console.log('RelatedBlogs::fetchRelatedBlogs => Starting...');
    try {
      if (tags) {
        // Split comma-separated tags into an array
        const tagArray = tags.split(',').map((tag) => tag.trim());
        // Build partial match patterns for ilike
        const tagsQuery = tagArray.map((tag) => `%${tag}%`);

        // Attempt to fetch related, published blogs
        const { data: relatedData, error } = await supabase
          .from('blogs')
          .select('title, slug, thumbnail_url, published_date')
          .neq('slug', slug)           // Exclude current blog
          .eq('status', 'published')   // Only published blogs
          .or(tagsQuery.map((tag) => `tags.ilike.${tag}`).join(','))
          .limit(7);                   // Limit to 7

        if (error) {
          console.log('RelatedBlogs::fetchRelatedBlogs => Error:', error);
          throw new Error(error.message);
        }

        // If none found, fetch fallback (latest) blogs
        if (!relatedData || relatedData.length === 0) {
          console.log('RelatedBlogs::fetchRelatedBlogs => No related blogs, fetching fallback.');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('blogs')
            .select('title, slug, thumbnail_url, published_date')
            .neq('slug', slug)
            .eq('status', 'published')
            .order('published_date', { ascending: false })
            .limit(7);

          if (fallbackError) {
            console.log('RelatedBlogs::fetchRelatedBlogs => Fallback Error:', fallbackError);
            throw new Error(fallbackError.message);
          }
          setRelatedBlogs(fallbackData || []);
        } else {
          console.log('RelatedBlogs::fetchRelatedBlogs => Related blogs found.');
          setRelatedBlogs(relatedData);
        }
      }
    } catch (err) {
      console.log('RelatedBlogs::fetchRelatedBlogs => Unexpected error:', err);
    }
  };

  // -------------------------------------------------------------------
  // useEffect: Trigger fetching when tags are available or changed.
  // -------------------------------------------------------------------
  useEffect(() => {
    if (tags && tags.length > 0) {
      console.log('RelatedBlogs::useEffect => Tags detected, fetching...');
      fetchRelatedBlogs();
    }
  }, [tags]);

  return (
    <aside className={styles.suggestedArticles}>
      <h3>Suggested Articles</h3>
      <ul>
        {relatedBlogs.map((related) => (
          <li key={related.slug} className={styles.relatedArticle}>
            {/* 
              Modern Link usage (no nested <a>).
              Just place your child elements directly under <Link> 
            */}
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

// -------------------------------------------------------------------
// COMPONENT: ReadBlog
// Main component that displays the single blog post in detail.
// -------------------------------------------------------------------
const ReadBlog = ({ blog }) => {
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [ogImageDimensions, setOgImageDimensions] = useState({ width: null, height: null });

  // -------------------------------------------------------------------
  // Validate blog thumbnail URL and fetch dimensions.
  // -------------------------------------------------------------------
  useEffect(() => {
    console.log('ReadBlog::useEffect => Determining OG image URL and dimensions.');

    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    };

    const getOgImageUrl = () => {
      if (!blog?.thumbnail_url) {
        // Provide a fallback OG image if none is provided
        return 'https://pandeykapil.com.np/logo/logo.webp';
      }
      if (isValidUrl(blog.thumbnail_url)) {
        return blog.thumbnail_url;
      }
      return `https://pandeykapil.com.np${blog.thumbnail_url}`;
    };

    // Set the OG image URL
    const url = getOgImageUrl();
    setOgImageUrl(url);

    // Fetch image dimensions using the browser's native Image API
    const img = new window.Image();
    img.onload = () => {
      console.log('ReadBlog::Image onload => Setting dimensions.');
      setOgImageDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  }, [blog?.thumbnail_url]);

  // -------------------------------------------------------------------
  // If no blog data is found, display an error and link back.
  // -------------------------------------------------------------------
  if (!blog) {
    console.log('ReadBlog::render => No blog found, displaying error.');
    return (
      <div className={styles.errorContainer}>
        <h2>Blog not found</h2>
        <Link href="/blogs">Back to blogs</Link>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Sanitize the blog content before rendering (XSS protection).
  // -------------------------------------------------------------------
  const sanitizedContent = DOMPurify.sanitize(blog.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//
  });

  // -------------------------------------------------------------------
  // Construct current URL for social sharing and canonical link.
  // -------------------------------------------------------------------
  const currentUrl = encodeURI(`https://pandeykapil.com.np/blogs/${blog.slug}`);

  // -------------------------------------------------------------------
  // Truncate meta description to avoid awkward cutoffs.
  // -------------------------------------------------------------------
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
    }
    return text;
  };

  // -------------------------------------------------------------------
  // RETURN: The actual JSX to render the blog page.
  // -------------------------------------------------------------------
  return (
    <>
      {/* 
        Head section for SEO:
          - Title
          - Meta Description
          - Author
          - Viewport for responsiveness
          - Canonical URL
          - Open Graph tags (title, desc, image, etc.)
          - JSON-LD structured data
      */}
      <Head>
        <title>{`${blog.title} - DynaBeats`}</title>
        <meta
          name="description"
          content={truncateText(
            blog.excerpt || `Read about ${blog.title} on DynaBeats Blog`,
            155
          )}
        />
        <meta name="author" content={blog.author || 'Unknown'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph (OG) tags */}
        <meta property="og:title" content={`${blog.title} | DynaBeats Blog`} />
        <meta
          property="og:description"
          content={blog.excerpt || `Read about ${blog.title} on DynaBeats Blog`}
        />
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

        {/* JSON-LD structured data for Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: blog.title,
            image: ogImageUrl,
            author: {
              '@type': 'Person',
              name: blog.author
            },
            datePublished: blog.published_date,
            dateModified: blog.updated_date || blog.published_date,
            description: blog.excerpt,
            mainEntityOfPage: currentUrl,
            publisher: {
              '@type': 'Organization',
              name: 'DynaBeats',
              logo: {
                '@type': 'ImageObject',
                url: 'https://pandeykapil.com.np/logo.png'
              }
            }
          })}
        </script>
      </Head>

      {/* Main blog container */}
      <div className={styles.readBlogContainer}>
        {/* Breadcrumb navigation for clarity */}
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <Link href="/">Home</Link> / 
          <Link href="/blogs">Blogs</Link> / 
          {blog.title}
        </nav>

        {/* Main layout: blog content + related articles */}
        <div className={styles.blogLayout}>
          {/* Blog content area */}
          <div className={styles.blogContent}>
            <header className={styles.blogHeader}>
              <h1>{blog.title}</h1>
              <p className={styles.blogMeta}>
                Written by <span>{blog.author || 'Unknown'}</span> on{' '}
                <span>{new Date(blog.published_date).toLocaleDateString()}</span>
              </p>
            </header>

            {/* Display main blog image if we have dimensions */}
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

            {/* Render sanitized HTML content */}
            <div
              className={styles.blogHtmlContent}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              aria-label="Blog content"
            />

            {/* Social Share Buttons */}
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

          {/* Related Articles in Sidebar */}
          <RelatedBlogs tags={blog.tags} slug={blog.slug} />
        </div>
      </div>
    </>
  );
};

// -------------------------------------------------------------------
// SERVER-SIDE DATA FETCH: getServerSideProps
// Fetch the blog post from Supabase based on the incoming slug.
// -------------------------------------------------------------------
export async function getServerSideProps({ params }) {
  console.log('ReadBlog::getServerSideProps => Fetching blog with slug:', params.slug);
  const { slug } = params;

  // Query the Supabase 'blogs' table for the given slug
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  // If error or no blog found, return a 404
  if (error || !blog) {
    console.log('ReadBlog::getServerSideProps => Blog not found or error:', error);
    return { notFound: true };
  }

  // Otherwise, pass the blog data as props
  console.log('ReadBlog::getServerSideProps => Found blog:', blog.title);
  return {
    props: { blog },
  };
}

export default ReadBlog;
