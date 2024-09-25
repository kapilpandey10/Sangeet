import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';

// Lazy load components
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
    metaDescription.content =
      'Discover the latest Nepali music lyrics, including popular and classic hits. Sangeet Lyrics Central offers a vast collection of Nepali music lyrics.';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content =
      'Sangeet lyrics Central, Nepali music, Nepali music lyrics, git sangit, Nepali music lyrics, Sangeet lyrics Central, Nepali git sangit, Nepali music lyrics, Nepali lyrics collection, latest Nepali songs, Nepali artists, song lyrics, Nepali songs lyrics, PandeyKapil, Nepali songwriters, Balen song, Nepali Music industry, Music Nepal';
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

  // Google AdSense component for rendering ads
  const GoogleAd = ({ adSlot }) => {
    useEffect(() => {
      // Ensure adsbygoogle is loaded when the component is rendered
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, []);

    return (
      <div className="ad-container">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    );
  };

  return (
    <div className="homepage-container">
      {/* Wrap the components with Suspense to handle lazy loading */}
      <Suspense fallback={<div>Loading Slider...</div>}>
        <HeroSlider />
      </Suspense>

      {/* Google Ad - Full-width ad below the HeroSlider */}
      <GoogleAd adSlot="1234567890" />

      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for Nepali music lyrics, spanning all genres and eras.</p>

      {loading ? (
        <p>Loading lyrics and artist... Hold On</p>
      ) : (
        <>
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

          {/* Google Ad - Between sections */}
          <GoogleAd adSlot="1234567891" />

          {/* Lazy load the HomeYTVideo component */}
          <Suspense fallback={<div>Loading YouTube Video...</div>}>
            <HomeYTVideo />
          </Suspense>

          {featuredArtist ? (
            <div className="featured-artist-section">
              <h2 className="featured-artist-title">Featured Nepali Artist</h2>
              <div className="featured-artist-container">
                {/* Lazy load the FeaturedArtistCard component */}
                <Suspense fallback={<div>Loading Artist Card...</div>}>
                  <FeaturedArtistCard artist={featuredArtist} />
                </Suspense>
              </div>
            </div>
          ) : (
            <p>No featured artist available.</p>
          )}

          {/* Google Ad - Sidebar or vertical corner ad */}
          <div className="sidebar-ad-container">
            <GoogleAd adSlot="1234567892" />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
