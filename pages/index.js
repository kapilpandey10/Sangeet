// File: pages/index.jsx

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
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

        {/* Open Graph Metadata with specified width and height */}
        <meta property="og:title" content="DynaBeat | Nepali Music Digital Library" />
        <meta
          property="og:description"
          content="Discover the latest Nepali music lyrics, including popular and classic hits. DynaBeat offers a vast collection of Nepali music lyrics."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DynaBeat Logo" />
        <meta property="og:site_name" content="DynaBeat" />
      </Head>

      {/* Google AdSense Script - Use Next.js Script component */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

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
              {/* Use Next.js Image component for image optimization */}
              <div className={styles.thumbnailWrapper}>
                <Image
                  src={lyric.thumbnail_url?.trim() || '/path/to/fallback-image.jpg'}
                  alt={`${lyric.title} thumbnail`}
                  className={styles.thumbnail}
                  width={150} // Define width
                  height={150} // Define height
                  layout="responsive" // Can be 'intrinsic', 'fixed', 'fill', 'responsive'
                />
              </div>
              <h3 className={styles.songTitle}>
                <Link href={`/viewlyrics/${lyric.slug}`}>
                  {lyric.title}
                </Link>
              </h3>
              <p>{lyric.artist}</p>
              <p>{lyric.published_date ? new Date(lyric.published_date).getFullYear() : 'N/A'}</p>
            </div>
          ))}
        </div>
        <div className={styles.viewAll}>
          <Link href="/lyrics">
            View All Nepali Lyrics
          </Link>
        </div>
      </section>

      {/* Ad between Lyrics and YouTube Video */}

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

      {/* AdSense Ad - Using ins tag with a key to force re-render if needed */}
      <div className={`${styles.adContainer} ${styles.scrollAnimated} ${styles.fadeIn}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="4756859110"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        {/*
          The script tag for adsbygoogle is now in the Head component.
          You can use useEffect with a state to push the ad, but the Script component
          is generally preferred for initial loading. A simple data-ad-slot will
          work with the main script.
        */}
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