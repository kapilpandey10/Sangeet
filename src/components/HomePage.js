import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';
import HomeYTVideo from './homeytvideo';
import FeaturedArtistCard from './FeaturedArtistCard';
import HeroSlider from './HeroSlider';


// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef(null);
  const [adInitialized, setAdInitialized] = useState(false);

  useEffect(() => {
    document.title = 'Sangeet Lyrics Central | Latest Lyrics';

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

        console.log("Fetched artists:", artistData); // Log all fetched artists for debugging

        if (artistError) {
          console.error('Error fetching artists:', artistError.message);
        } else if (artistData && artistData.length > 0) {
          const randomArtist = artistData[Math.floor(Math.random() * artistData.length)]; // Select a random artist
          setFeaturedArtist(randomArtist);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    if (!adInitialized && adRef.current && !adRef.current.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current.classList.add('adsbygoogle-initialized');
      setAdInitialized(true);
    }
  }, [adInitialized]);

  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  return (
    <div className="homepage-container">
      <meta name="description" content="Sangeet Lyrics Central is the ultimate destination for song lyrics. Explore lyrics across genres and eras." />
      <meta name="keywords" content="lyrics, music, artists, song lyrics, songwriters" />
      <meta name="author" content="Sangeet Lyrics Central" />
      <meta name="robots" content="index, follow" />

      <div className="floating-emoji emoji-1">🎶</div>
      <div className="floating-emoji emoji-2">🎵</div>
      <div className="floating-emoji emoji-3">♭</div>
      <div className="floating-emoji emoji-5">🎶</div>
      <div className="floating-emoji emoji-6">🎵</div>
      <div className="floating-emoji emoji-9">♭</div>

      <HeroSlider />

      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for song lyrics, spanning all genres and eras.</p>

      {loading ? (
        <p>Loading lyrics and artist... Hold On</p>
      ) : (
        <>
          <section className="lyrics-bar">
            <h2>Featured Lyrics</h2>
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
              <Link to="/lyrics">View All Lyrics</Link>
            </div>
          </section>

          <HomeYTVideo />

{/* Display Featured Artist */}
{featuredArtist ? (
  <div className="featured-artist-section">
    <h2 className="featured-artist-title">Featured Artist</h2>
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
