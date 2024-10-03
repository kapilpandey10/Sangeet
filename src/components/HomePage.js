import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Helmet for SEO
import '../style/HomePage.css'; // Include your CSS here
import HotNews from './hotnews'; // Import the HotNews component

const HomeYTVideo = React.lazy(() => import('./homeytvideo'));
const FeaturedArtistCard = React.lazy(() => import('./FeaturedArtistCard'));
const HeroSlider = React.lazy(() => import('./HeroSlider'));

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set SEO meta tags using Helmet
    document.title = 'Sangeet Lyrics Central | Nepali Music Digital Library for Song Lyrics';

    // Fetch all data from Supabase
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: allLyrics, error: lyricsError } = await supabase
          .from('lyrics')
          .select('id, title, artist, published_date, slug')
          .eq('status', 'approved');

        if (lyricsError) {
          console.error('Error fetching lyrics:', lyricsError.message);
          setLyrics([]);
        } else if (allLyrics && allLyrics.length > 0) {
          const randomLyrics = getRandomLyrics(allLyrics, 4);
          setLyrics(randomLyrics);
        }

        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('status', 'approved');

        if (artistError) {
          console.error('Error fetching artists:', artistError.message);
        } else if (artistData && artistData.length > 0) {
          const randomArtist = artistData[Math.floor(Math.random() * artistData.length)];
          setFeaturedArtist(randomArtist);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Stop observing once visible
        }
      });
    });

    const scrollElements = document.querySelectorAll('.scroll-animated');
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  const formatTitleForURL = (title) => {
    return title.replace(/\s+/g, '_').toLowerCase();
  };

  return (
    <div className="homepage-container">
      <Helmet>
        <title>Sangeet Lyrics Central | Nepali Music Digital Library</title>
        <meta name="description" content="Discover the latest Nepali music lyrics, including popular and classic hits. Sangeet Lyrics Central offers a vast collection of Nepali music lyrics." />
        <meta name="keywords" content="Sangeet lyrics Central, Nepali music, Nepali music lyrics, git sangit, Nepali lyrics collection, latest Nepali songs, Nepali artists" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />
        {/* Add JSON-LD structured data here if necessary */}
      </Helmet>

      {/* Hero Slider */}
      <Suspense fallback={<div className="skeleton-box"></div>}>
        <div className="scroll-animated fade-in">
          <HeroSlider />
        </div>
      </Suspense>

      <h1 className="scroll-animated fade-in-up">Welcome to Sangeet Lyrics Central</h1>
      <p className="scroll-animated fade-in-up">Your ultimate destination for Nepali music lyrics, spanning all genres and eras.</p>

      {loading ? (
        <>
          {/* Skeleton for Lyrics Section */}
          <div className="skeleton-loader">
            <div className="skeleton-title"></div>
            <div className="skeleton-lyrics-item"></div>
            <div className="skeleton-lyrics-item"></div>
            <div className="skeleton-lyrics-item"></div>
            <div className="skeleton-lyrics-item"></div>
          </div>

          {/* Skeleton for YouTube Video */}
          <div className="skeleton-yt-video"></div>
        </>
      ) : (
        <>
          {/* Lyrics Section */}
          <section className="lyrics-bar scroll-animated fade-in-up">
            <h2>Featured Nepali Lyrics</h2>
            <div className="lyrics-horizontal-bar">
              {lyrics.map((lyric, index) => (
                <div className={`lyric-item color-${index % 4}`} key={lyric.id}>
                  <h3>{lyric.title}</h3>
                  <p>{lyric.artist}</p>
                  <p>{new Date(lyric.published_date).getFullYear()}</p>
                  <Link to={`/lyrics/${lyric.slug}`}>Read Lyrics</Link>
                </div>
              ))}
            </div>
            <div className="view-all">
              <Link to="/lyrics-list">View All Nepali Lyrics</Link>
            </div>
          </section>

          {/* YouTube Video Section */}
          <div className="homeytvideo scroll-animated fade-in-up">
            <Suspense fallback={<div className="skeleton-yt-video"></div>}>
              <HomeYTVideo />
            </Suspense>
          </div>

          {/* Featured Artist Section */}
          {featuredArtist && (
            <div className="featured-artist-section scroll-animated fade-in-up">
              <h2 className="featured-artist-title">Featured Nepali Artist</h2>
              <div className="featured-artist-container">
                <Suspense fallback={<div className="skeleton-box"></div>}>
                  <FeaturedArtistCard artist={featuredArtist} />
                </Suspense>
              </div>
            </div>
          )}
        </>
      )}

      {/* AdSense */}
      <div className="ad-container scroll-animated fade-in">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="4756859110"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>

      {/* Include HotNews component */}
      <HotNews />
    </div>
  );
};

export default HomePage;
