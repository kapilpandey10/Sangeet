import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';
import HomeYTVideo from './homeytvideo'; // Import the HomeYTVideo component
import DOMPurify from 'dompurify'; // For sanitizing HTML


// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sangeet Lyrics Central | Latest Lyrics";

    const fetchAllLyrics = async () => {
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
          setLoading(false);
          return;
        }

        if (allLyrics && allLyrics.length > 0) {
          // Randomly select 4 lyrics
          const randomLyrics = getRandomLyrics(allLyrics, 4);
          setLyrics(randomLyrics);
        } else {
          setLyrics([]); // No lyrics found
        }

        setLoading(false);

      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLoading(false);
      }
    };

    const fetchArtists = async () => {
      try {
        const { data: allArtists, error: artistsError } = await supabase
          .from('artists')
          .select('*');

        if (artistsError) {
          console.error('Error fetching artists:', artistsError.message);
          setArtists([]);
          return;
        }

        setArtists(allArtists || []);
      } catch (error) {
        console.error('Error fetching artists:', error.message);
      }
    };

    fetchAllLyrics();
    fetchArtists();

    // Initialize Google Ads
    const adElement = document.querySelector('.adsbygoogle');
    if (adElement && !adElement.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adElement.classList.add('adsbygoogle-initialized');
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
  }, []);

  // Function to get random lyrics from the full list
  const getRandomLyrics = (allLyrics, limit) => {
    const shuffled = allLyrics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  return (
    <div className="homepage-container">
      {/* Floating Emojis */}
      <div className="floating-emoji emoji-1">🎶</div>
      <div className="floating-emoji emoji-2">🎵</div>
      <div className="floating-emoji emoji-3">♭</div>
      <div className="floating-emoji emoji-55">4</div>

      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for song lyrics, spanning all genres and eras.</p>

      {loading ? (
        <p>Loading lyrics... Hold On</p>
      ) : (
        <>
          <section className="lyrics-bar">
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

          {/* Display artist cards */}
          <section className="artist-cards">
            <h2>Featured Artists</h2>
            <div className="artist-card-container">
              {artists.map((artist) => (
                <div className="artist-card" key={artist.name}>
                  <img src={artist.image_url} alt={artist.name} className="artist-card-image" />
                  <h3>{artist.name}</h3>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(artist.bio.substring(0, 150)), // Sanitize bio to avoid HTML rendering issues
                    }}
                  ></p>
                  <Link to={`/artistbio/${artist.name}`}>Read More</Link>
                </div>
              ))}
            </div>
          </section>
        </>
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
        ></ins>
      </div>
    </div>
  );
};

export default HomePage;
