import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/HomePage.module.css';

// Use Next.js dynamic import for components
const HomeYTVideo = dynamic(() => import('./homeytvideo'), { ssr: false });
const FeaturedArtistCard = dynamic(() => import('./FeaturedArtistCard'), { ssr: false });
const HeroSlider = dynamic(() => import('../components/HeroSlider'), { ssr: false });

const HomePage = ({ lyrics, featuredArtist }) => {
  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    });

    const scrollElements = document.querySelectorAll(`.${styles.scrollAnimated}`);
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Initialize Google Ads
  useEffect(() => {
    const initializeAds = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', 'ca-pub-9887409333966239');
      document.body.appendChild(script);
    };

    initializeAds();
  }, []);

  return (
    <div className={styles.homepageContainer}>
      <Head>
        <title>DynaBeat | Nepali Music Digital Library</title>
        <meta
          name="description"
          content="Discover the latest Nepali music lyrics, including popular and classic hits. DynaBeat offers a vast collection of Nepali music lyrics."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />

        {/* Facebook Domain Verification */}
        <meta
          name="facebook-domain-verification"
          content="82v2jn8h0hodfxbj21rlnxos5ocy4o"
        />

        {/* Open Graph Metadata */}
        <meta property="og:title" content="DynaBeat | Nepali Music Digital Library" />
        <meta
          property="og:description"
          content="Discover the latest Nepali music lyrics, including popular and classic hits. DynaBeat offers a vast collection of Nepali music lyrics."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:image:alt" content="DynaBeat Logo" />
        <meta property="og:site_name" content="DynaBeat" />
      </Head>

      {/* Hero Slider */}
      <div className={`${styles.scrollAnimated} ${styles.fadeIn}`}>
        <HeroSlider />
      </div>

      <h1 className={styles.heading}>Welcome to DynaBeat</h1>

      {/* Featured Music Lyrics */}
      <section className={`${styles.lyricsBar} ${styles.scrollAnimated} ${styles.fadeInUp}`}>
        <h2>Featured Music Lyrics</h2>
        <div className={styles.lyricsHorizontalBar}>
          {lyrics.map((lyric, index) => (
            <div
              className={`${styles.lyricItem} ${styles[`color${index % 6}`]}`}
              key={lyric.id}
            >
              {/* Thumbnail or Fallback */}
              {lyric.thumbnail_url ? (
                <img
                  src={lyric.thumbnail_url}
                  alt={`${lyric.title} thumbnail`}
                  className={styles.thumbnail}
                />
              ) : (
                <img
                  src="/path/to/fallback-image.jpg"
                  alt="No Thumbnail Available"
                  className={styles.thumbnail}
                />
              )}
              <h3 className={styles.songTitle}>
                <Link href={`/lyrics/${lyric.slug}`} legacyBehavior>
                  <a>{lyric.title}</a>
                </Link>
              </h3>
              <p>{lyric.artist}</p>
              <p>{new Date(lyric.published_date).getFullYear()}</p>
            </div>
          ))}
        </div>
        <div className={styles.viewAll}>
          <Link href="/lyrics" legacyBehavior>
            <a>View All Nepali Lyrics</a>
          </Link>
        </div>
      </section>

      {/* Ad between Lyrics and YouTube Video */}
      <div className={`${styles.adContainer} ${styles.scrollAnimated} ${styles.fadeIn}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="4756859110"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      {/* YouTube Video Section */}
      <div className={`${styles.homeytvideo} ${styles.scrollAnimated} ${styles.fadeInUp}`}>
        <HomeYTVideo />
      </div>

      {/* Featured Artist Section */}
      {featuredArtist && (
        <div className={`${styles.featuredArtistSection} ${styles.scrollAnimated} ${styles.fadeInUp}`}>
          <h2 className={styles.featuredArtistTitle}>Featured Nepali Artist</h2>
          <div className={styles.featuredArtistContainer}>
            <FeaturedArtistCard artist={featuredArtist} />
          </div>
        </div>
      )}

      {/* Another Ad after Featured Artist Section */}
      <div className={`${styles.adContainer} ${styles.scrollAnimated} ${styles.fadeIn}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="4756859110"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = [...allLyrics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  try {
    const { data: allLyrics, error: lyricsError } = await supabase
      .from('lyrics')
      .select('id, title, artist, published_date, slug, thumbnail_url')
      .eq('status', 'approved');

    if (lyricsError) throw new Error('Error fetching lyrics:', lyricsError.message);

    const lyrics = getRandomLyrics(allLyrics, 6);

    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('status', 'approved');

    if (artistError) throw new Error('Error fetching artists:', artistError.message);

    const featuredArtist =
      artistData.length > 0
        ? artistData[Math.floor(Math.random() * artistData.length)]
        : null;

    return {
      props: {
        lyrics,
        featuredArtist,
      },
    };
  } catch (error) {
    console.error(error.message);
    return {
      props: {
        lyrics: [],
        featuredArtist: null,
      },
    };
  }
};

export default HomePage;
