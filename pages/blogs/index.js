import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaArrowRight, FaNewspaper, FaClock } from 'react-icons/fa';
import styles from './style/BlogHomepage.module.css';

const BlogHomepage = ({ blogs = [] }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "DynaBeat Music & Culture",
    "description": "Latest news and deep dives into Nepali music culture.",
    "publisher": {
      "@type": "Organization",
      "name": "DynaBeat",
      "logo": "https://pandeykapil.com.np/logo/logo.webp"
    }
  };

  const hasBlogs = blogs && blogs.length > 0;
  const featuredBlog = hasBlogs ? blogs[0] : null;
  const regularBlogs = hasBlogs ? blogs.slice(1) : [];

  return (
    <div className={styles.blogContainer}>
      <Head>
        <title>DynaStories | Nepali Music News</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>

      <header className={styles.blogHeader}>
        <h1 className={styles.mainTitle}>Dyna<span>Stories</span></h1>
        <p className={styles.subSubtitle}>The Pulse of Nepali Music Culture</p>
      </header>

      <main className={styles.blogMain}>
        {/* FEATURED SPOTLIGHT */}
        {featuredBlog ? (
          <section className={styles.featuredSection}>
            <Link href={`/blogs/${featuredBlog.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <Image 
                  src={featuredBlog.thumbnail_url || '/logo/logo.webp'} 
                  alt={featuredBlog.title}
                  fill
                  priority
                />
                <span className={styles.categoryBadge}>Featured Story</span>
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.metaRow}>
                  <span><FaCalendarAlt /> {new Date(featuredBlog.created_at).toLocaleDateString()}</span>
                  <span><FaUser /> {featuredBlog.author}</span>
                </div>
                <h2>{featuredBlog.title}</h2>
                {/* Use the dedicated 'excerpt' column to avoid raw HTML */}
                <p>{featuredBlog.excerpt || "Read the latest update from DynaBeat."}</p>
                <span className={styles.readMore}>Read Full Story <FaArrowRight /></span>
              </div>
            </Link>
          </section>
        ) : (
          <p className={styles.noData}>No featured stories available at the moment.</p>
        )}

        {/* HEADLINES GRID */}
        <section className={styles.newsGridSection}>
          <div className={styles.sectionHeader}>
            <h3><FaClock /> Recent Headlines</h3>
            <div className={styles.divider}></div>
          </div>
          
          <div className={styles.blogsGrid}>
            {regularBlogs.map((blog) => (
              <Link href={`/blogs/${blog.slug}`} key={blog.id} className={styles.newsCard}>
                <div className={styles.cardThumb}>
                  <Image 
                    src={blog.thumbnail_url || '/logo/logo.webp'} 
                    alt={blog.title}
                    fill
                  />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardDate}>{new Date(blog.created_at).toLocaleDateString()}</span>
                  <h4>{blog.title}</h4>
                  {/* Use 'excerpt' here as well to keep the card clean */}
                  <p>{blog.excerpt ? blog.excerpt.substring(0, 100) + '...' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { props: { blogs: blogs || [] } };
  } catch (error) {
    return { props: { blogs: [] } };
  }
};

export default BlogHomepage;