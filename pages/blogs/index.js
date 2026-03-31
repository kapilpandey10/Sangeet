import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaArrowRight, FaClock } from 'react-icons/fa';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* ── Masthead ── */}
      <header className={styles.blogHeader}>
        <p className={styles.mastheadEyebrow}>Est. 2024 &nbsp;·&nbsp; Nepali Music Culture</p>
        <h1 className={styles.mainTitle}>
          Dyna<em>Stories</em>
        </h1>
        <div className={styles.mastheadRule}>
          <span className={styles.subSubtitle}>The Pulse of Nepali Music</span>
        </div>
        <div className={styles.mastheadStrip}>
          <span className={styles.stripItem}>Music</span>
          <span className={styles.stripDot} />
          <span className={styles.stripItem}>Artists</span>
          <span className={styles.stripDot} />
          <span className={styles.stripItem}>Culture</span>
          <span className={styles.stripDot} />
          <span className={styles.stripItem}>Reviews</span>
          <span className={styles.stripDot} />
          <span className={styles.stripItem}>Interviews</span>
          <span className={styles.stripDot} />
          <span className={styles.stripItem}>Events</span>
        </div>
      </header>

      <main className={styles.blogMain}>

        {/* ── Featured Spotlight ── */}
        {featuredBlog ? (
          <section className={styles.featuredSection}>
            <div className={styles.featuredLabel}>
              <span className={styles.featuredLabelLine} />
              <span className={styles.featuredLabelText}>Featured Story</span>
            </div>

            <Link href={`/blogs/${featuredBlog.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <Image
                  src={featuredBlog.thumbnail_url || '/logo/logo.webp'}
                  alt={featuredBlog.title}
                  fill
                  priority
                />
                <div className={styles.featuredImageOverlay} />
                <span className={styles.categoryBadge}>Cover Story</span>
                <span className={styles.issueNumber}>01</span>
              </div>

              <div className={styles.featuredContent}>
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <FaCalendarAlt />
                    {new Date(featuredBlog.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <span className={styles.metaDivider} />
                  <span className={styles.metaItem}>
                    <FaUser />
                    {featuredBlog.author}
                  </span>
                </div>

                <h2>{featuredBlog.title}</h2>
                <div className={styles.featuredDivider} />
                <p>{featuredBlog.excerpt || 'Read the latest from DynaBeat — your source for Nepali music and culture.'}</p>

                <span className={styles.readMore}>
                  Read Full Story <FaArrowRight />
                </span>
              </div>
            </Link>
          </section>
        ) : (
          <p className={styles.noData}>No featured stories available at the moment.</p>
        )}

        {/* ── Headlines Grid ── */}
        {regularBlogs.length > 0 && (
          <section className={styles.newsGridSection}>
            <div className={styles.sectionHeader}>
              <h3><FaClock /> Recent Headlines</h3>
              <div className={styles.divider} />
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
                    <span className={styles.cardDate}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                    <h4>{blog.title}</h4>
                    {blog.excerpt && (
                      <p>{blog.excerpt.substring(0, 100)}…</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { props: { blogs: blogs || [] } };
  } catch (error) {
    return { props: { blogs: [] } };
  }
};

export default BlogHomepage;