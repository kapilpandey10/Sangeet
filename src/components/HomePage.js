import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';
import HomeYTVideo from './homeytvideo'; // Import the HomeYTVideo component
import DOMPurify from 'dompurify'; // For sanitizing HTML
import FeaturedArtistCard from './FeaturedArtistCard'; // Import the FeaturedArtistCard component
import HeroSlider from './HeroSlider'; // Import the HeroSlider component


// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [artists, setArtists] = useState([]); // Store multiple artists
  const [loading, setLoading] = useState(true);
  const adRef = useRef(null); // Reference for the ad element
  const [adInitialized, setAdInitialized] = useState(false); // Track ad initialization

  useEffect(() => {
    document.title = "Sangeet Lyrics Central | Latest Lyrics";

    const fetchAllData = async () => {
      setLoading(true);

      try {
        // Fetch all lyrics
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

        // Fetch all artists
        const { data: allArtists, error: artistsError } = await supabase
          .from('artists')
          .select('*');

        if (artistsError) {
          console.error('Error fetching artists:', artistsError.message);
          setArtists([]);
        } else {
          const randomArtists = getRandomArtists(allArtists, 3); // Fetch three random artists
          setArtists(randomArtists);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Initialize Google Ads once
    if (!adInitialized && adRef.current && !adRef.current.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current.classList.add('adsbygoogle-initialized');
      setAdInitialized(true); // Ensure this runs only once
    }

    // Floating Emoji Setup
    const emojis = document.querySelectorAll('.floating-emoji');
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      emojis.forEach((emoji, index) => {
        const speed = 10 + index * 5;
        const xPos = (window.innerWidth / 2 - x) / speed;
        const yPos = (window.innerHeight / 2 - y) / speed;
        emoji.style.transform = `translate(${xPos}px, ${yPos}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [adInitialized]); // Depend on adInitialized to prevent multiple ad pushes

  // Function to get random lyrics from the full list
  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  // Function to get three random artists
  const getRandomArtists = (allArtists, limit = 3) => {
    const shuffled = allArtists.sort(() => 0.5 - Math.random()); // Shuffle artists
    return shuffled.slice(0, limit); // Return the first 'limit' number of artists
  };

  return (
    <div className="homepage-container">
      {/* Floating Emojis */}
      <div className="floating-emoji emoji-1">🎶</div>
      <div className="floating-emoji emoji-2">🎵</div>
      <div className="floating-emoji emoji-3">♭</div>
      <div className="floating-emoji emoji-5">🎶</div>
      <div className="floating-emoji emoji-6">🎵</div>
      <div className="floating-emoji emoji-9">♭</div>
      
     {/* Hero Slider */}
     <HeroSlider /> {/* Add the hero slider */}
      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for song lyrics, spanning all genres and eras.</p>

      {loading ? (
        <p>Loading lyrics and artist... Hold On</p>
      ) : (
        <>
          {/* Display Lyrics */}
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

          {/* Render the HomeYTVideo component after the lyrics */}
          <HomeYTVideo />

          {/* Display Featured Artists */}
          {artists.length > 0 && (
            <section className="featured-artists">
              <h2>Featured Artists</h2>
              <div className="featured-artists-grid">
                {artists.map((artist) => (
                  <FeaturedArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Google AdSense Ad */}
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
