import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from '../styles/HomePage.module.css';

const HomeYTVideo = dynamic(() => import('./homeytvideo'), { ssr: false });
const FeaturedArtistCard = dynamic(() => import('./FeaturedArtistCard'), { ssr: false });
const HeroSlider = dynamic(() => import('../components/HeroSlider'), { ssr: false });
const NewRelease = dynamic(() => import('../components/NewRelease'), { ssr: false });

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

  // JSON-LD Structured Data for Advanced SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DynaBeat",
    "url": "https://pandeykapil.com.np/",
    "description": "Nepal's ultimate digital library for  music lyrics, artist biographies, and live radio.",
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
        <meta name="description" content="Discover thousands of Nepali music lyrics, explore detailed artist biographies, and stream live radio globally. DynaBeat is your ultimate destination for music and culture." />
        <meta name="keywords" content="Nepali Music Lyrics,Music Lyrics, Nepali Song Lyrics, Live Radio Nepal, Nepali Artist Biography, DynaBeat Music, Stream Nepali Songs Online" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />

        {/* Open Graph / Facebook SEO */}
        <meta property="og:title" content="DynaBeat | Ultimate Nepali Music & Radio Library" />
        <meta property="og:description" content="Access a massive collection of Nepali lyrics and live international radio stations on DynaBeat." />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta property="og:site_name" content="DynaBeat" />

        {/* Twitter Card SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DynaBeat | Nepali Lyrics & Live Radio" />
        <meta name="twitter:description" content="Explore Nepali lyrics and global radio stations." />
        <meta name="twitter:image" content="https://pandeykapil.com.np/logo/logo.webp" />

        {/* Structured Data Script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />

     <header className={styles.heroSection}>
  <div className={styles.heroOverlay}>
    <h1 className={styles.mainTitle}>
      Dyna<span>Beat</span>
    </h1>
    <h2 className={styles.advancedSubtitle}>
      The Premier Archive for <strong> Music</strong>, Artist Bios & Live Radio.
    </h2>
    <p className={styles.seoDescription}>
      Access thousands of verified  song lyrics and international radio stations in one modern digital library.
    </p>
  </div>
</header>

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
                    alt={`Lyrics for ${lyric.title} by ${lyric.artist}`}
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={styles.cardOverlay}>
                    <span className={styles.playIcon}>▶</span>
                  </div>
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

        {/* SEO-Rich Text Section (Essential for Search Ranking) */}
        <article className={`${styles.seoArticle} ${styles.scrollAnimated}`}>
          <div className={styles.seoInner}>
            <h2>DynaBeat: Your Premier Archive for Nepali Music Culture</h2>
            <p>
              Welcome to <strong>DynaBeat</strong>, the most comprehensive digital hub for music lovers. 
              Whether you are searching for the latest <strong>Nepali song lyrics</strong> or looking to 
              discover deep insights through our <strong>artist biographies</strong>, we provide a unified 
              platform for everything musical.
            </p>
            <h3>Live Radio Streaming Across Borders</h3>
            <p>
              Beyond being a lyrics repository, DynaBeat bridges the gap between traditional radio and modern 
              listeners. Use our player to tune into <strong>live global radio stations</strong> from Nepal, 
              India, and beyond, ensuring you stay connected to live broadcasts anywhere in the world.
            </p>
            <h3>Comprehensive Nepali Song Lyrics Database</h3>
            <p>
              From evergreen classics to modern pop hits, our database is meticulously curated to provide 
              accurate, community-verified <strong>Nepali music lyrics</strong> for fans across the globe.
            </p>
          </div>
        </article>
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