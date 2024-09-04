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
  const [latestVideoId, setLatestVideoId] = useState(''); // Store latest video ID

  useEffect(() => {
    document.title = "Sangeet Lyrics Central | Latest Lyrics";

    const fetchApprovedLyrics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(4);  // Limit to the latest 4 lyrics

      if (error) {
        console.error('Error fetching approved lyrics:', error);
        setLyrics([]); // Set to an empty array on error
      } else {
        setLyrics(data);
      }
      setLoading(false);
    };

    const fetchLatestYouTubeVideo = async () => {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('video_id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching latest YouTube video:', error);
        setLatestVideoId(''); // Reset if there's an error
      } else if (data.length > 0) {
        setLatestVideoId(data[0].video_id); // Set the latest video ID
      }
    };

    fetchApprovedLyrics();
    fetchLatestYouTubeVideo(); // Fetch the latest YouTube video

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

  const renderYouTubeVideo = () => {
    if (!latestVideoId) return null;

    return (
      <div className="youtube-video-section">
        <h3>Check out our latest video</h3>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${latestVideoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
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
        <p>Loading latest lyrics...</p>
      ) : (
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
      )}

      {/* Display the latest YouTube video */}
      {renderYouTubeVideo()}

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
