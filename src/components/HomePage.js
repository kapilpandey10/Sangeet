import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sangeet Lyrics Central | Latest Lyrics";

    const fetchApprovedLyrics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }) // Order by 'created_at' for the latest added
        .limit(4);  // Limit to the latest 4 lyrics

      if (error) {
        console.error('Error fetching approved lyrics:', error);
        setLyrics([]); // Set to an empty array on error
      } else {
        setLyrics(data);
      }
      setLoading(false);
    };

    fetchApprovedLyrics();

    // Initialize Google Ads
    const adElement = document.querySelector('.adsbygoogle');
    if (adElement && !adElement.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adElement.classList.add('adsbygoogle-initialized'); // Mark the ad as initialized
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

  return (
    <div className="homepage-container">
      {/* Floating Emojis */}
      <div className="floating-emoji emoji-1">🎶</div>
      <div className="floating-emoji emoji-2">🎵</div>
      <div className="floating-emoji emoji-3">♭</div>
      <div className="floating-emoji emoji-4">🎼</div>

      <h1>Welcome to Sangeet Lyrics Central</h1>
      <p>Your ultimate destination for song lyrics, spanning all genres and eras.</p>
      
      {loading ? (
        <p>Loading latest lyrics...</p>
      ) : (
        <section className="lyrics-bar">
          {lyrics.length > 0 ? (
            <div className="lyrics-horizontal-bar">
              {lyrics.map((lyric, index) => (
                <div className={`lyric-item color-${index % 4}`} key={lyric.id}>
                  <h3>{lyric.title}</h3>
                  <p>{lyric.artist}</p>
                  <p>{new Date(lyric.published_date).getFullYear()}</p> {/* Display year */}
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
