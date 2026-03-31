import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import DOMPurify from 'dompurify';
import {
  FaTwitter, FaFacebook, FaClock, FaEye, FaArrowLeft,
  FaCalendarAlt, FaLink, FaWhatsapp, FaTag
} from 'react-icons/fa';
import styles from './style/ReadBlog.module.css';

const SITE_URL = 'https://pandeykapil.com.np';
const FALLBACK_IMAGE = `${SITE_URL}/logo/logo.webp`;

// FIX #2: Derive OG image MIME type from the actual file extension
// instead of hardcoding 'image/jpeg', which breaks previews for .webp / .png.
const getImageMimeType = (url = '') => {
  if (url.endsWith('.webp')) return 'image/webp';
  if (url.endsWith('.png'))  return 'image/png';
  if (url.endsWith('.gif'))  return 'image/gif';
  return 'image/jpeg'; // safe default for .jpg / unknown
};

const ReadBlog = ({ blog, relatedBlogs = [] }) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewCount, setViewCount]             = useState(blog?.views || 0);
  const [copied, setCopied]                   = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const articleRef = useRef(null);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect          = el.getBoundingClientRect();
      const articleHeight = el.offsetHeight;
      const scrolledPx    = Math.max(0, -rect.top);
      const progress      = Math.min(100, (scrolledPx / (articleHeight - window.innerHeight)) * 100);
      setReadingProgress(Math.max(0, progress));
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Increment views
  useEffect(() => {
    if (blog?.id) {
      const increment = async () => {
        const { data, error } = await supabase.rpc('increment_blog_views', { blog_id: blog.id });
        if (!error && data) setViewCount(data);
      };
      increment();
    }
  }, [blog?.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!blog) return (
    <div className={styles.errorPage}>
      <span className={styles.errorCode}>404</span>
      <h2>Story not found.</h2>
      <Link href="/blogs" className={styles.errorBack}>← Back to Newsroom</Link>
    </div>
  );

  // FIX #6: Strip HTML tags BEFORE counting words so <div>, <p>, <span> etc.
  // are not counted as words, which inflated the reading time estimate.
  const textOnly = (blog.content || '').replace(/<[^>]+>/g, ' ');
  const readTime  = Math.max(1, Math.ceil(textOnly.split(/\s+/).filter(Boolean).length / 200));

  const currentUrl = `${SITE_URL}/blogs/${blog.slug}`;

  // Guard against relative paths (Supabase URLs are already absolute).
  const ogImage = blog.thumbnail_url
    ? blog.thumbnail_url.startsWith('http')
      ? blog.thumbnail_url
      : `${SITE_URL}${blog.thumbnail_url}`
    : FALLBACK_IMAGE;

  // FIX #2 (applied): Derive the real MIME type from the URL.
  const ogImageType = getImageMimeType(ogImage);

  const publishDate   = new Date(blog.published_date);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const isoDatePublished = publishDate.toISOString();

  // FIX #5: Use updated_at for dateModified so Google can track freshness.
  // Falls back to published_date if the column doesn't exist yet.
  const isoDateModified = blog.updated_at
    ? new Date(blog.updated_at).toISOString()
    : isoDatePublished;

  // FIX #1: Content is already stripped server-side in getServerSideProps.
  // The client-side extractBodyContent() function has been removed entirely.
  // blog.content is safe to sanitize directly here.
  const sanitizedContent = typeof window !== 'undefined'
    ? DOMPurify.sanitize(blog.content || '', {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
      })
    : blog.content || '';

  // FIX #8: Keep the browser <title> with branding but use a clean og:title
  // so WhatsApp / Telegram / Facebook previews don't show "| DynaBeat".
  const pageTitle   = `${blog.title} | DynaBeat`;
  const ogTitle     = blog.title; // clean, no suffix
  const pageDescription = blog.excerpt || 'Read the latest Nepali music news on DynaBeat.';

  // FIX #4: article:section should be a single broad category, not a tag list.
  // We derive a single section label and split tags into individual meta tags.
  const tagList   = (blog.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const ogSection = blog.category || tagList[0] || 'Music'; // use a dedicated category if available

  // FIX #10: Use full ImageObject in JSON-LD so Google can index the image properly.
  // FIX #5: Use isoDateModified for dateModified.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline:    blog.title,
    description: pageDescription,
    image: [{
      '@type':  'ImageObject',
      url:      ogImage,
      // FIX #3: We cannot guarantee dimensions from Supabase uploads,
      // so we omit width/height here to let Google measure them directly.
      // Add width/height back only if you enforce a fixed upload resolution in your CMS.
    }],
    datePublished: isoDatePublished,
    dateModified:  isoDateModified,  // FIX #5
    author: {
      '@type': 'Person',
      name: blog.author || 'DynaBeat Editor',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DynaBeat',
      logo: {
        '@type': 'ImageObject',
        url: FALLBACK_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    articleSection: ogSection,      // FIX #4: single category string
    keywords: tagList.join(', '),   // proper field for tag list
    wordCount: textOnly.split(/\s+/).filter(Boolean).length, // FIX #6: uses stripped text
  };

  return (
    <div className={styles.pageWrapper}>
      <Head>
        {/* ── Primary ── */}
        <title key="title">{pageTitle}</title>
        <meta key="description"  name="description"  content={pageDescription} />
        <meta key="keywords"     name="keywords"      content={`${tagList.join(', ')}, nepali music, dynabeat, music news`} />
        <link key="canonical"    rel="canonical"      href={currentUrl} />

        {/* FIX #7: Explicit robots directive.
            max-image-preview:large tells Google to show large thumbnails in search. */}
        <meta key="robots" name="robots" content="index, follow, max-image-preview:large" />

        {/* ── Open Graph ── */}
        <meta key="og:site_name"   property="og:site_name"   content="DynaBeat" />
        <meta key="og:locale"      property="og:locale"      content="en_US" />
        <meta key="og:type"        property="og:type"        content="article" />
        <meta key="og:url"         property="og:url"         content={currentUrl} />
        {/* FIX #8: Use clean ogTitle (no "| DynaBeat") for social previews */}
        <meta key="og:title"       property="og:title"       content={ogTitle} />
        <meta key="og:description" property="og:description" content={pageDescription} />

        {/* FIX #2: Use derived MIME type, not hardcoded "image/jpeg" */}
        {/* FIX #3: Width/height omitted — we can't guarantee Supabase upload dimensions.
            Facebook will fetch and measure the image itself, which is more reliable. */}
        <meta key="og:image"            property="og:image"            content={ogImage} />
        <meta key="og:image:secure_url" property="og:image:secure_url" content={ogImage} />
        <meta key="og:image:type"       property="og:image:type"       content={ogImageType} />
        <meta key="og:image:alt"        property="og:image:alt"        content={blog.title} />

        {/* Article-specific OG */}
        <meta key="article:published_time" property="article:published_time" content={isoDatePublished} />
        {/* FIX #5: Use real modified time */}
        <meta key="article:modified_time"  property="article:modified_time"  content={isoDateModified} />
        <meta key="article:author"         property="article:author"         content={blog.author || 'DynaBeat Editor'} />
        {/* FIX #4: Single category in article:section */}
        <meta key="article:section"        property="article:section"        content={ogSection} />
        {/* FIX #4: One article:tag per tag instead of a comma-separated blob */}
        {tagList.map(tag => (
          <meta key={`article:tag:${tag}`} property="article:tag" content={tag} />
        ))}

        {/* ── Twitter / X Card ── */}
        <meta key="twitter:card"        name="twitter:card"        content="summary_large_image" />
        {/* FIX #9: Only include twitter:site if the handle is verified and active */}
        <meta key="twitter:site"        name="twitter:site"        content="@DynaBeat" />
        <meta key="twitter:creator"     name="twitter:creator"     content="@DynaBeat" />
        <meta key="twitter:url"         name="twitter:url"         content={currentUrl} />
        {/* FIX #8: Use clean ogTitle for Twitter card as well */}
        <meta key="twitter:title"       name="twitter:title"       content={ogTitle} />
        <meta key="twitter:description" name="twitter:description" content={pageDescription} />
        <meta key="twitter:image"       name="twitter:image"       content={ogImage} />
        <meta key="twitter:image:alt"   name="twitter:image:alt"   content={blog.title} />

        {/* ── JSON-LD (FIX #10: ImageObject, FIX #5: dateModified) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Reading progress bar */}
      <div className={`${styles.progressRail} ${scrolled ? styles.progressVisible : ''}`}>
        <div className={styles.progressBar} style={{ width: `${readingProgress}%` }} />
      </div>

      {/* Sticky nav */}
      <nav className={`${styles.stickyNav} ${scrolled ? styles.stickyNavVisible : ''}`}>
        <Link href="/blogs" className={styles.stickyBack}>
          <FaArrowLeft /> Newsroom
        </Link>
        <span className={styles.stickyTitle}>{blog.title}</span>
        <div className={styles.stickyShare}>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
            target="_blank" rel="noopener noreferrer"
            className={styles.stickyShareBtn}
            aria-label="Share on Twitter"
          ><FaTwitter /></a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className={styles.stickyShareBtn}
            aria-label="Share on Facebook"
          ><FaFacebook /></a>
          <button onClick={copyLink} className={styles.stickyShareBtn} aria-label="Copy link">
            {copied ? '✓' : <FaLink />}
          </button>
        </div>
      </nav>

      <main className={styles.main}>

        {/* ── ARTICLE HERO ── */}
        <div className={styles.heroSection}>
          <div className={styles.heroInner}>
            <Link href="/blogs" className={styles.backLink}>
              <FaArrowLeft /> Back to Newsroom
            </Link>

            {tagList.length > 0 && (
              <div className={styles.categoryStrip}>
                <FaTag className={styles.tagIcon} />
                <span>{tagList[0]}</span>
              </div>
            )}

            <h1 className={styles.headline}>{blog.title}</h1>

            {blog.excerpt && (
              <p className={styles.dek}>{blog.excerpt}</p>
            )}

            <div className={styles.byline}>
              <div className={styles.bylineAuthor}>
                <div className={styles.authorAvatar}>
                  {(blog.author || 'D').charAt(0).toUpperCase()}
                </div>
                <div className={styles.authorMeta}>
                  <span className={styles.authorName}>{blog.author || 'DynaBeat Editor'}</span>
                  <span className={styles.authorRole}>Staff Writer · DynaBeat</span>
                </div>
              </div>
              <div className={styles.bylineMeta}>
                <span className={styles.metaItem}>
                  <FaCalendarAlt className={styles.metaIcon} />
                  <time dateTime={isoDatePublished}>{formattedDate}</time>
                </span>
                <span className={styles.metaDivider}>·</span>
                <span className={styles.metaItem}>
                  <FaClock className={styles.metaIcon} />
                  {readTime} min read
                </span>
                <span className={styles.metaDivider}>·</span>
                <span className={styles.metaItem}>
                  <FaEye className={styles.metaIcon} />
                  {viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── HERO IMAGE ── */}
        {blog.thumbnail_url && (
          <div className={styles.heroImageWrap}>
            <div className={styles.heroImageInner}>
              <Image
                src={blog.thumbnail_url}
                alt={blog.title}
                fill
                className={styles.heroImage}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
              <div className={styles.heroImageOverlay} />
            </div>
          </div>
        )}

        {/* ── CONTENT + SIDEBAR ── */}
        <div className={styles.contentWrap}>
          <div className={styles.contentGrid}>

            {/* Left share column */}
            <aside className={styles.shareColumn} aria-label="Share article">
              <div className={styles.shareSticky}>
                <span className={styles.shareLabel}>Share</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`${styles.shareBtn} ${styles.shareFb}`}
                  aria-label="Share on Facebook"
                ><FaFacebook /></a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`${styles.shareBtn} ${styles.shareTw}`}
                  aria-label="Share on Twitter"
                ><FaTwitter /></a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + currentUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`${styles.shareBtn} ${styles.shareWa}`}
                  aria-label="Share on WhatsApp"
                ><FaWhatsapp /></a>
                <button
                  onClick={copyLink}
                  className={`${styles.shareBtn} ${styles.shareCopy} ${copied ? styles.shareCopied : ''}`}
                  aria-label="Copy link"
                >{copied ? '✓' : <FaLink />}</button>
              </div>
            </aside>

            {/* Main article */}
            <article
              ref={articleRef}
              className={styles.article}
              itemScope
              itemType="https://schema.org/NewsArticle"
            >
              <meta itemProp="headline"      content={blog.title} />
              <meta itemProp="datePublished" content={isoDatePublished} />
              <meta itemProp="dateModified"  content={isoDateModified} />
              <meta itemProp="author"        content={blog.author || 'DynaBeat Editor'} />

              <div
                className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags */}
              {tagList.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Filed under:</span>
                  {tagList.map(tag => (
                    <span key={tag} className={styles.tagChip}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Share footer */}
              <div className={styles.shareFooter}>
                <div className={styles.shareFooterRule} />
                <h3 className={styles.shareFooterTitle}>Enjoyed this story? Share the beat.</h3>
                <div className={styles.shareFooterBtns}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className={styles.shareFooterBtn}
                  ><FaFacebook /> Share on Facebook</a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className={styles.shareFooterBtn}
                  ><FaTwitter /> Post on Twitter</a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + currentUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className={styles.shareFooterBtn}
                  ><FaWhatsapp /> Send via WhatsApp</a>
                  <button onClick={copyLink} className={styles.shareFooterBtn}>
                    <FaLink /> {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </article>

            {/* Right sidebar */}
            <aside className={styles.sidebar} aria-label="Related stories">
              <div className={styles.sidebarSticky}>
                <div className={styles.sidebarHeader}>
                  <span className={styles.sidebarRule} />
                  <h3 className={styles.sidebarTitle}>More Headlines</h3>
                </div>
                {relatedBlogs.length > 0 ? (
                  <div className={styles.relatedList}>
                    {relatedBlogs.map((item, i) => (
                      <Link href={`/blogs/${item.slug}`} key={item.id} className={styles.relatedCard}>
                        <span className={styles.relatedNum}>0{i + 1}</span>
                        <div className={styles.relatedContent}>
                          {item.thumbnail_url && (
                            <div className={styles.relatedThumb}>
                              <Image
                                src={item.thumbnail_url}
                                alt={item.title}
                                fill
                                sizes="80px"
                              />
                            </div>
                          )}
                          <h4 className={styles.relatedTitle}>{item.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noRelated}>No related stories yet.</p>
                )}

                {/* Newsletter CTA */}
                <div className={styles.newsletterBox}>
                  <div className={styles.newsletterIcon}>♪</div>
                  <h4 className={styles.newsletterTitle}>Stay in the beat</h4>
                  <p className={styles.newsletterText}>Get the latest Nepali music news delivered to your inbox.</p>
                  <Link href="/newsletter" className={styles.newsletterBtn}>Subscribe Free</Link>
                </div>
              </div>
            </aside>

          </div>
        </div>

      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Strips the full HTML document wrapper server-side.
// Content in DB is stored as <!DOCTYPE html> documents — extracting only
// the <body> prevents rogue <title> / <meta> tags from the stored document
// bleeding into the page <head> during SSR.
// FIX #1: This is the ONLY place stripping happens. The client-side
// extractBodyContent() function has been removed to avoid double-stripping.
// ─────────────────────────────────────────────────────────────────────────────
function stripToBodyContent(html = '') {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  return html
    .replace(/<head[\s\S]*?<\/head>/i, '')
    .replace(/<\/?(?:html|body)[^>]*>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '');
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !blog) return { notFound: true };

  // FIX #1: Strip HTML body content here (server-side) only — never again client-side.
  const cleanedBlog = {
    ...blog,
    content: stripToBodyContent(blog.content || ''),
  };

  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select('id, title, slug, thumbnail_url, published_date')
    .neq('id', blog.id)
    .eq('status', 'published')
    .order('published_date', { ascending: false })
    .limit(4);

  return {
    props: {
      blog: cleanedBlog,
      relatedBlogs: relatedBlogs || [],
    },
  };
}

export default ReadBlog;