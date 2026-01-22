import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from '../styles/HomePage.module.css';

// Dynamic imports for performance optimization
const HomeYTVideo = dynamic(() => import('./homeytvideo'), { ssr: false });
const FeaturedArtistCard = dynamic(() => import('./FeaturedArtistCard'), { ssr: false });
const HeroSlider = dynamic(() => import('../components/HeroSlider'), { ssr: false });
const NewRelease = dynamic(() => import('../components/NewRelease'), { ssr: false });

// Reusable Ad Slot Component to prevent Layout Shift (CLS)
const HomeAdSlot = ({ id }) => (
  <div className={styles.homeAdWrapper}>
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-9887409333966239"
         data-ad-slot={id}
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
  </div>
);

const HomePage = ({ lyrics, featuredArtist }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, { threshold: 0.1 });

    const scrollElements = document.querySelectorAll(`.${styles.scrollAnimated}`);
    scrollElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DynaBeat",
    "url": "https://pandeykapil.com.np/",
    "description": "Nepal's ultimate digital library for music lyrics, artist biographies, and live radio.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://pandeykapil.com.np/searchresults?query={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className={styles.homepageContainer}>
      <Head>
        <title>DynaBeat | Nepali Music Lyrics, Artist Bios & Live Radio Hub</title>
        <meta name="description" content="Discover thousands of Nepali music lyrics, explore detailed artist biographies, and stream live radio globally." />
        <meta name="keywords" content="Nepali Music Lyrics, Music Lyrics, Nepali Song Lyrics, Live Radio Nepal, Nepali Artist Biography, DynaBeat Music" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />

        {/* SEO / Open Graph */}
        <meta property="og:title" content="DynaBeat | Ultimate Nepali Music & Radio Library" />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:type" content="website" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Professional AdSense Script Loading */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />

      <header className={styles.heroSection}>
        <div className={styles.heroOverlay}>
          <h1 className={styles.mainTitle}>Dyna<span>Beat</span></h1>
          <h2 className={styles.advancedSubtitle}>
            The Premier Archive for <strong>Music</strong>, Artist Bios & Live Radio.
          </h2>
          <p className={styles.seoDescription}>
            Access thousands of verified song lyrics and international radio stations in one modern digital library.
          </p>
        </div>
      </header>

      {/* AD SLOT 1: TOP BILLBOARD */}
      <HomeAdSlot id="YOUR_TOP_AD_ID" />

      <main className={styles.mainContent}>
        <section className={`${styles.section} ${styles.scrollAnimated}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending Nepali Lyrics</h2>
            <Link href="/lyrics" className={styles.viewAllBtn}>Explore All Lyrics →</Link>
          </div>
          
          <div className={styles.lyricsGrid}>
            {lyrics.map((lyric) => (
              <Link href={`/viewlyrics/${lyric.slug}`} key={lyric.id} className={styles.glassCard}>
                <div className={styles.imageContainer}>
                  <Image
                    src={lyric.thumbnail_url?.trim() || '/logo/logo.webp'}
                    alt={`Lyrics for ${lyric.title}`}
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={styles.cardOverlay}><span className={styles.playIcon}>▶</span></div>
                </div>
                <div className={styles.cardDetails}>
                  <h3 className={styles.songTitle}>{lyric.title}</h3>
                  <p className={styles.artistName}>{lyric.artist}</p>
                  <span className={styles.yearBadge}>
                    {lyric.published_date ? new Date(lyric.published_date).getFullYear() : '2026'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <NewRelease />

        {/* AD SLOT 2: MID-CONTENT RECTANGLE */}
        <HomeAdSlot id="YOUR_MIDDLE_AD_ID" />

        <section className={`${styles.videoSection} ${styles.scrollAnimated}`}>
           <HomeYTVideo />
        </section>

        {featuredArtist && (
          <section className={`${styles.artistSpotlight} ${styles.scrollAnimated}`}>
             <div className={styles.spotlightHeader}>
                <h2 className={styles.sectionTitle}>Artist Spotlight</h2>
             </div>
             <FeaturedArtistCard artist={featuredArtist} />
          </section>
        )}

        {/* SEO-Rich Text Section */}
        <article className={`${styles.seoArticle} ${styles.scrollAnimated}`}>
          <div className={styles.seoInner}>
            <h2>DynaBeat: Your Premier Archive for Nepali Music Culture</h2>
            <p>
              Welcome to <strong>DynaBeat</strong>, the most comprehensive digital hub for music lovers. 
              From <strong>Nepali song lyrics</strong> to <strong>artist biographies</strong>, we provide 
              a platform for everything musical.
            </p>
            <h3>Live Radio Streaming Across Borders</h3>
            <p>
              Tune into <strong>live global radio stations</strong> from Nepal, India, and beyond, 
              staying connected to live broadcasts anywhere.
            </p>
          </div>
        </article>

        {/* AD SLOT 3: BOTTOM ANCHOR */}
        <HomeAdSlot id="YOUR_BOTTOM_AD_ID" />
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const { data: allLyrics } = await supabase.from('lyrics').select('id, title, artist, published_date, slug, thumbnail_url').eq('status', 'approved');
    const lyrics = allLyrics ? [...allLyrics].sort(() => 0.5 - Math.random()).slice(0, 6) : [];
    const { data: artistData } = await supabase.from('artists').select('*').eq('status', 'approved');
    const featuredArtist = artistData?.length > 0 ? artistData[Math.floor(Math.random() * artistData.length)] : null;
    return { props: { lyrics, featuredArtist } };
  } catch (error) {
    return { props: { lyrics: [], featuredArtist: null } };
  }
};

export default HomePage;