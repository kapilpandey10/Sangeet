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
    <div className={styles.page}>
      <Head>
        <title>DynaStories | Nepali Music News</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* ── Hero header ── */}
      <header className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>The Pulse of Nepali Music</p>
          <h1 className={styles.heroTitle}>Dyna<span>Stories</span></h1>
          <p className={styles.heroSub}>
            In-depth features, interviews & culture from the Nepali music scene
          </p>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Featured ── */}
        {featuredBlog ? (
          <section className={styles.featuredSection}>
            <div className={styles.sectionTag}>Featured Story</div>
            <Link href={`/blogs/${featuredBlog.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredImg}>
                <Image
                  src={featuredBlog.thumbnail_url || '/logo/logo.webp'}
                  alt={featuredBlog.title}
                  fill
                  priority
                  className={styles.featuredImgEl}
                />
                <div className={styles.featuredImgOverlay} />
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.featuredMeta}>
                  <span><FaCalendarAlt /> {new Date(featuredBlog.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</span>
                  <span><FaUser /> {featuredBlog.author}</span>
                </div>
                <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                <p className={styles.featuredExcerpt}>
                  {featuredBlog.excerpt || 'Read the latest update from DynaBeat.'}
                </p>
                <div className={styles.readMore}>
                  Read Full Story <FaArrowRight className={styles.arrowIcon} />
                </div>
              </div>
            </Link>
          </section>
        ) : (
          <p className={styles.noData}>No featured stories yet.</p>
        )}

        {/* ── Grid ── */}
        {regularBlogs.length > 0 && (
          <section className={styles.gridSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTag}><FaClock /> Recent Headlines</div>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.grid}>
              {regularBlogs.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className={styles.card}>
                  <div className={styles.cardImg}>
                    <Image
                      src={blog.thumbnail_url || '/logo/logo.webp'}
                      alt={blog.title}
                      fill
                      className={styles.cardImgEl}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardDate}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                    </span>
                    <h4 className={styles.cardTitle}>{blog.title}</h4>
                    {blog.excerpt && (
                      <p className={styles.cardExcerpt}>
                        {blog.excerpt.substring(0, 110)}{'...'}
                      </p>
                    )}
                    <div className={styles.cardReadMore}>Read more <FaArrowRight /></div>
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
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { props: { blogs: blogs || [] } };
  } catch (error) {
    return { props: { blogs: [] } };
  }
};

export default BlogHomepage;