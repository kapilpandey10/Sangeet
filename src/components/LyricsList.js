import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import '../style/LyricsList.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LyricsList = () => {
  const [lyricsByArtist, setLyricsByArtist] = useState({});

  useEffect(() => {
    const fetchLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .order('artist', { ascending: true });

      if (error) {
        console.error('Error fetching lyrics:', error);
      } else {
        const groupedByArtist = data.reduce((result, lyric) => {
          const { artist } = lyric;
          if (!result[artist]) {
            result[artist] = [];
          }
          result[artist].push(lyric);
          return result;
        }, {});
        setLyricsByArtist(groupedByArtist);
      }
    };

    fetchLyrics();
  }, []);

  return (
    <div className="lyrics-list-container">
      <h1>Music Library</h1>
      {Object.keys(lyricsByArtist).length > 0 ? (
        Object.keys(lyricsByArtist).map((artist) => (
          <div key={artist} className="artist-section">
            <h2>{artist}</h2>
            <div className="lyrics-grid">
              {lyricsByArtist[artist].map((lyric) => (
                <div key={lyric.id} className="lyric-card">
                  <div className="lyric-card-content">
                    <h3>{lyric.title}</h3>
                    <p>Published: {lyric.published_date}</p>
                    <Link to={`/lyrics/${lyric.id}`} className="view-lyrics-button">View Lyrics</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No lyrics available.</p>
      )}
    </div>
  );
};

export default LyricsList;
