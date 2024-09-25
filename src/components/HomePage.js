import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';

const HomeYTVideo = React.lazy(() => import('./homeytvideo'));
const FeaturedArtistCard = React.lazy(() => import('./FeaturedArtistCard'));
const HeroSlider = React.lazy(() => import('./HeroSlider'));

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Sangeet Lyrics Central | Nepali Music Digital Library for Song Lyrics';
    
    // Add meta tags for SEO
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Discover the latest Nepali music lyrics, including popular and classic hits. Sangeet Lyrics Central offers a vast collection of Nepali music lyrics.';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'Sangeet lyrics Central, Nepali music, Nepali music lyrics, git sangit, Nepali music lyrics, Nepali lyrics collection, latest Nepali songs, Nepali artists';
    document.head.appendChild(metaKeywords);

    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
      document.head.removeChild(metaRobots);
    };
  }, []);

  // Fetch lyrics and featured artist
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: allLyrics, error: lyricsError } = await supabase
          .from('lyrics')
          .select('id, title, artist, published_date')
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

  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  const formatTitleForURL = (title) => {
    return title.replace(/\s+/g, '_').toLowerCase();
  };

  return (
    <div className="homepage-container">
      {/* Hero Slider */}
      <Suspense fallback={<div>Loading Slider...</div>}>
        <HeroSlider />
      </Suspense>

      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for Nepali music lyrics, spanning all genres and eras.</p>

      {loading ? (
        <p>Loading lyrics and artist... Hold On</p>
      ) : (
        <>
          {/* Lyrics Section */}
          <section className="lyrics-bar">
            <h2>Featured Nepali Lyrics</h2>
            {lyrics.length > 0 ? (
              <div className="lyrics-horizontal-bar">
                {lyrics.map((lyric, index) => (
                  <div className={`lyric-item color-${index % 4}`} key={lyric.id}>
                    <h3>{lyric.title}</h3>
                    <p>{lyric.artist}</p>
                    <p>{new Date(lyric.published_date).getFullYear()}</p>
                    <Link to={`/lyrics/${formatTitleForURL(lyric.title)}`}>Read Lyrics</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>No lyrics available at the moment.</p>
            )}
            <div className="view-all">
              <Link to="/lyrics-list">View All Nepali Lyrics</Link>
            </div>
          </section>

          {/* Insert AdSense Ad in Between Sections */}
          <div className="ad-container">
            {/* Hori-lyrics Ad */}
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

          {/* YouTube Video Section */}
          <Suspense fallback={<div>Loading YouTube Video...</div>}>
            <HomeYTVideo />
          </Suspense>

          {/* Featured Artist Section */}
          {featuredArtist ? (
            <div className="featured-artist-section">
              <h2 className="featured-artist-title">Featured Nepali Artist</h2>
              <div className="featured-artist-container">
                <Suspense fallback={<div>Loading Artist Card...</div>}>
                  <FeaturedArtistCard artist={featuredArtist} />
                </Suspense>
              </div>
            </div>
          ) : (
            <p>No featured artist available.</p>
          )}

          {/* Insert AdSense Ad at the Bottom */}
          <div className="ad-container">
            {/* Another Ad Slot */}
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
        </>
      )}
    </div>
  );
};

export default HomePage;
