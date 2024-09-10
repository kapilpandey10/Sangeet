import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient'; // Import from the centralized supabaseClient file
import { Link } from 'react-router-dom';
import '../style/HomePage.css';
import HomeYTVideo from './homeytvideo';
import FeaturedArtistCard from './FeaturedArtistCard';
import HeroSlider from './HeroSlider';

// Initialize Supabase client
const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef(null);
  const [adInitialized, setAdInitialized] = useState(false);

  // Fetch data for lyrics and featured artist
  useEffect(() => {
    document.title = 'Nepali Music Lyrics Collection | Latest Nepali Songs - Sangeet Lyrics Central';

    // Add meta tags for SEO
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content =
      'Discover the latest Nepali music lyrics, including popular and classic hits. Sangeet Lyrics Central offers a vast collection of Nepali music lyrics.';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content =
      'Sangeet lyrics Central, Nepali music, Nepali music lyrics, git sangit, Nepali music lyrics, Sangeet lyrics Central, Nepali git sangit, Nepali music lyrics, Nepali lyrics collection, latest Nepali songs, Nepali artists, song lyrics, Nepali  songs lyrics, PandeyKapil, Nepali songwriters, Balen song, Nepali Music industry, Music Nepal';
    document.head.appendChild(metaKeywords);

    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow';
    document.head.appendChild(metaRobots);

    // Cleanup meta tags on component unmount
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
        // Fetch lyrics
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

        // Fetch all approved artists and randomly select one
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

  // Initialize Google AdSense only once
  useEffect(() => {
    if (!adInitialized && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current.classList.add('adsbygoogle-initialized');
        setAdInitialized(true); // Only set this once to avoid re-renders
      } catch (error) {
        console.error('Error initializing Google AdSense:', error);
      }
    }
  }, [adInitialized]);

  // Function to get random lyrics
  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  return (
    <div className="homepage-container">
      <HeroSlider />

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
                    <Link to={`/lyrics/${lyric.id}`}>Read Lyrics</Link>
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

          <HomeYTVideo />

          {/* Display Featured Artist */}
          {featuredArtist ? (
            <div className="featured-artist-section">
              <h2 className="featured-artist-title">Featured Nepali Artist</h2>
              <div className="featured-artist-container">
                <FeaturedArtistCard artist={featuredArtist} />
              </div>
            </div>
          ) : (
            <p>No featured artist available.</p>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9887409333966239"
              data-ad-slot="6720877169"
              data-ad-format="auto"
              data-full-width-responsive="true"
              ref={adRef}
            ></ins>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
