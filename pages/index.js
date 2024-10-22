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

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to shuffle and return random lyrics
  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = [...allLyrics].sort(() => 0.5 - Math.random()); // Shuffle the lyrics
    return shuffled.slice(0, limit); // Return a limited number of lyrics (6 in this case)
  };

  // Fetch data for lyrics and artists
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: allLyrics, error: lyricsError } = await supabase
          .from('lyrics')
          .select('id, title, artist, published_date, slug')
          .eq('status', 'approved');

        if (lyricsError) throw new Error('Error fetching lyrics:', lyricsError.message);

        setLyrics(getRandomLyrics(allLyrics, 6)); // Set the initial random 6 lyrics

        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('status', 'approved');

        if (artistError) throw new Error('Error fetching artists:', artistError.message);

        if (artistData && artistData.length > 0) {
          const randomArtist = artistData[Math.floor(Math.random() * artistData.length)];
          setFeaturedArtist(randomArtist);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set an interval to refresh random lyrics every 2 minutes
    const intervalId = setInterval(() => {
      fetchAllData(); // Fetch new random lyrics every 2 minutes
    }, 120000); // 2 minutes in milliseconds (120,000 ms)

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Intersection observer for animation trigger
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
        <meta name="description" content="Discover the latest Nepali music lyrics, including popular and classic hits. Dynabeat offers a vast collection of Nepali music lyrics." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />
      </Head>

      {/* Hero Slider */}
      <div className={`${styles.scrollAnimated} ${styles.fadeIn}`}>
        <HeroSlider />
      </div>

      <h1 className={styles.heading}>Welcome to DynaBeat</h1>
    
      {loading ? (
        <>
          {/* Skeleton for Lyrics Section */}
          <div className={styles.skeletonLoader}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonLyricsItem}></div>
            <div className={styles.skeletonLyricsItem}></div>
          </div>

          {/* Skeleton for YouTube Video */}
          <div className={styles.skeletonYTVideo}></div>
        </>
      ) : (
        <>
          {/* Lyrics Section */}
          <section className={`${styles.lyricsBar} ${styles.scrollAnimated} ${styles.fadeInUp}`}>
            <h2>Featured Music Lyrics</h2>
            <div className={styles.lyricsHorizontalBar}>
              {lyrics.map((lyric, index) => (
                <div className={`${styles.lyricItem} ${styles[`color${index % 6}`]}`} key={lyric.id}>
                  <h3>{lyric.title}</h3>
                  <p>{lyric.artist}</p>
                  <p>{new Date(lyric.published_date).getFullYear()}</p>
                  <Link href={`/lyrics/${lyric.slug}`} legacyBehavior>
                    <a>Read Lyrics</a>
                  </Link>
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
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
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
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
