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
    const fetchApprovedLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'approved'); // Only fetch approved lyrics
  
      if (error) {
        console.error('Error fetching approved lyrics:', error);
      } else {
        setLyrics(data);
      }
    };
  
    fetchApprovedLyrics();
  }, []);

  return (
    <div className="homepage-container">
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
    </div>
  );
};

export default HomePage;
