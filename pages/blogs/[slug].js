import React from 'react';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import styles from './style/ReadBlog.module.css';
import Head from 'next/head';
import { FaTwitter, FaFacebook } from 'react-icons/fa';

// Related Blogs Component
const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = React.useState([]);

  React.useEffect(() => {
    const fetchRelatedBlogs = async () => {
      const { data: relatedData, error } = await supabase
        .from('blogs')
        .select('title, slug, thumbnail_url, published_date')
        .neq('slug', slug)
        .ilike('tags', `%${tags.join('%')}%`)
        .limit(5);

      if (!relatedData || relatedData.length === 0) {
        const { data: fallbackData } = await supabase
          .from('blogs')
          .select('title, slug, thumbnail_url, published_date')
          .neq('slug', slug)
          .order('published_date', { ascending: false })
          .limit(5);
        setRelatedBlogs(fallbackData || []);
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
        {relatedBlogs.map((related) => (
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
        ))}
      </ul>
    </aside>
  );
};

// Blog Component
const ReadBlog = ({ blog }) => {
  if (!blog) {
    return (
      <div className={styles.errorContainer}>
        <h2>Blog not found</h2>
        <Link href="/blogs">Back to blogs</Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(blog.content);
  const blogImage = blog.thumbnail_url || '/default-thumbnail.jpg';
  const currentUrl = `https://pandeykapil.com.np/blogs/${blog.slug}`;

  return (
    <div className={styles.readBlogContainer}>
      {/* SEO Metadata */}
      <Head>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta name="keywords" content={`Blog, ${blog.title}, ${blog.author}, ${blog.tags.join(', ')}`} />
        <meta name="author" content={blog.author} />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph (OG) tags for social media sharing */}
        <meta property="og:title" content={blog.title || 'PandeyKapil Blog'} />
        <meta property="og:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta property="og:image" content={blogImage} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="PandeyKapil Blogs" />

        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title || 'PandeyKapil Blog'} />
        <meta name="twitter:description" content={blog.excerpt || 'Read this blog post on important topics'} />
        <meta name="twitter:image" content={blogImage} />
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
            src={blogImage}
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

        <RelatedBlogs tags={blog.tags} slug={blog.slug} />
      </div>
    </div>
  );
};

// Use getStaticPaths to define dynamic routes for SSG
export async function getStaticPaths() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug');

  const paths = blogs.map((blog) => ({
    params: { slug: blog.slug },
  }));

  return { paths, fallback: 'blocking' }; // Fallback blocking for dynamic new paths
}

// Fetch the blog data at build time
export async function getStaticProps({ params }) {
  const { slug } = params;
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!blog) {
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
