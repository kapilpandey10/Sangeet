import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import { FaTwitter, FaFacebook, FaClock, FaEye, FaArrowLeft, FaShareAlt, FaCalendarAlt } from 'react-icons/fa';
import styles from './style/ReadBlog.module.css';

const ReadBlog = ({ blog, relatedBlogs = [] }) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewCount, setViewCount] = useState(blog?.views || 0);

  // 1. Interactive: Reading Progress Bar
  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadingProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // 2. Database Action: Increment Views
  useEffect(() => {
    if (blog?.id) {
      const incrementViews = async () => {
        const { data, error } = await supabase.rpc('increment_blog_views', { blog_id: blog.id });
        if (!error && data) setViewCount(data);
      };
      incrementViews();
    }
  }, [blog?.id]);

  if (!blog) return <div className={styles.errorContainer}><h2>Story not found.</h2><Link href="/blogs">Back to Blogs</Link></div>;

  const readTime = Math.ceil((blog.content || "").split(' ').length / 200);
  const currentUrl = `https://pandeykapil.com.np/blogs/${blog.slug}`;

  // Sanitize Content for Security
  const sanitizedContent = typeof window !== 'undefined' ? DOMPurify.sanitize(blog.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
  }) : blog.content;

  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>{`${blog.title} | DynaBeat Stories`}</title>
        <meta name="description" content={blog.excerpt || "Read the latest Nepali music news on DynaBeat."} />
        <meta property="og:image" content={blog.thumbnail_url || '/logo/logo.webp'} />
        <meta property="og:type" content="article" />
      </Head>

      {/* Modern Top Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${readingProgress}%` }}></div>
      </div>

      <main className={styles.readBlogContainer}>
        <Link href="/blogs" className={styles.backBtn}><FaArrowLeft /> Back to Newsroom</Link>

        <header className={styles.articleHeader}>
          <div className={styles.categoryBadge}>Inside Music</div>
          <h1 className={styles.mainTitle}>{blog.title}</h1>
          
          <div className={styles.authorBar}>
            <div className={styles.authorInfo}>
              <strong>{blog.author || 'DynaBeat Editor'}</strong>
              <span><FaCalendarAlt /> {new Date(blog.published_date).toLocaleDateString()}</span>
            </div>
            <div className={styles.statsRow}>
              <span><FaClock /> {readTime} min read</span>
              <span><FaEye /> {viewCount} views</span>
            </div>
          </div>
        </header>

        <div className={styles.heroImageBox}>
          <Image 
            src={blog.thumbnail_url || '/logo/logo.webp'} 
            alt={blog.title} 
            fill 
            className={styles.heroImage}
            priority 
          />
        </div>

        <div className={styles.layoutBody}>
          <article className={styles.mainContent}>
            <div 
              className={styles.blogHtmlContent}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
            
            <div className={styles.shareSection}>
               <h3>Enjoyed this story? Share the beat.</h3>
               <div className={styles.shareBtns}>
                 <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" className={styles.fbBtn}><FaFacebook /> Facebook</a>
                 <a href={`https://twitter.com/intent/tweet?url=${currentUrl}`} target="_blank" className={styles.twBtn}><FaTwitter /> Twitter</a>
               </div>
            </div>
          </article>

          {/* Fixed Related Sidebar */}
          <aside className={styles.sidebar}>
            <h3>More Headlines</h3>
            <div className={styles.relatedGrid}>
              {relatedBlogs.length > 0 ? relatedBlogs.map((item) => (
                <Link href={`/blogs/${item.slug}`} key={item.id} className={styles.sideCard}>
                   <div className={styles.sideThumb}>
                     <Image src={item.thumbnail_url || '/logo/logo.webp'} alt={item.title} fill />
                   </div>
                   <h4>{item.title}</h4>
                </Link>
              )) : <p>No related stories yet.</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // 1. Fetch the main blog story
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !blog) return { notFound: true };

  // 2. Fetch related blogs for the sidebar
  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select('id, title, slug, thumbnail_url')
    .neq('id', blog.id) // Don't show the current post
    .limit(4);

  return { 
    props: { 
      blog, 
      relatedBlogs: relatedBlogs || [] // Fallback to empty array to prevent .map() error
    } 
  };
}

export default ReadBlog;