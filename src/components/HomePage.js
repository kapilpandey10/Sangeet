import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';

const HomePage = () => {
  const [lyrics, setLyrics] = useState([]);
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    document.title = "Sangeet Lyrics Central | Latest Lyrics";

    const fetchApprovedLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'approved')
        .order('published_date', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching approved lyrics:', error);
      } else {
        setLyrics(data);
      }
    };

    fetchApprovedLyrics();

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
      
      <section className="lyrics-bar">
        {lyrics.length > 0 ? (
          <div className="lyrics-horizontal-bar">
            {lyrics.map((lyric, index) => (
              <div className={`lyric-item color-${index % 4}`} key={lyric.id}>
                <h3>{lyric.title}</h3>
                <p>{lyric.artist}</p>
                <Link to={`/lyrics/${lyric.id}`}>Read Lyrics</Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No lyrics available.</p>
        )}
        <div className="view-all">
          <Link to="/lyrics">View All Lyrics</Link>
        </div>
      </section>

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
     crossorigin="anonymous"></script>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-9887409333966239"
     data-ad-slot="4756859110"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

    </div>
  );
};

export default HomePage;
