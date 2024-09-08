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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleArtists, setVisibleArtists] = useState(10); // For "Load More" functionality

  useEffect(() => {
    // Set the page title
    document.title = "Nepali Song Lyrics Library | Sangeet Lyrics Central";

    // Add meta tags for SEO
    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    
    metaDescription.content = "Explore a vast collection of Nepali song lyrics from various artists. Find lyrics from popular Nepali songs and artists, including the latest hits.";
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = "keywords";
    metaKeywords.content = "Nepali song lyrics, Nepali artists, Nepali music, Nepali songs, popular Nepali lyrics, Sangeet Lyrics Central";
    document.head.appendChild(metaKeywords);

    const metaOgTitle = document.createElement('meta');
    metaOgTitle.setAttribute("property", "og:title");
    metaOgTitle.content = "Nepali Song Lyrics Library | Sangeet Lyrics Central";
    document.head.appendChild(metaOgTitle);

    const metaOgDescription = document.createElement('meta');
    metaOgDescription.setAttribute("property", "og:description");
    metaOgDescription.content = "Explore the Nepali music library with lyrics from various Nepali artists. Discover the beauty of Nepali songs and lyrics.";
    document.head.appendChild(metaOgDescription);

    const metaOgUrl = document.createElement('meta');
    metaOgUrl.setAttribute("property", "og:url");
    metaOgUrl.content = window.location.href; // Use current URL
    document.head.appendChild(metaOgUrl);

    return () => {
      // Cleanup meta tags when component unmounts
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
      document.head.removeChild(metaOgTitle);
      document.head.removeChild(metaOgDescription);
      document.head.removeChild(metaOgUrl);
    };
  }, []);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('status', 'approved') // Only fetch approved lyrics
          .order('artist', { ascending: true });

        if (error) {
          throw error;
        }

        const groupedByArtist = data.reduce((result, lyric) => {
          const artists = lyric.artist.split(',').map(artist => artist.trim()); // Split multiple artists
          
          artists.forEach(artist => {
            if (!result[artist]) {
              result[artist] = [];
            }
            result[artist].push(lyric);
          });
          return result;
        }, {});

        setLyricsByArtist(groupedByArtist);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setError('Failed to load lyrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter results based on search query (artist, lyrics, or writer)
  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter(lyric =>
      lyric.title.toLowerCase().includes(searchQuery) ||
      lyric.artist.toLowerCase().includes(searchQuery) ||
      (lyric.lyrics_writer && lyric.lyrics_writer.toLowerCase().includes(searchQuery))
    );

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  // "Load More" functionality to display more artists
  const loadMoreArtists = () => {
    setVisibleArtists((prevVisible) => prevVisible + 10);
  };

  if (loading) {
    return <p>Loading lyrics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="lyrics-list-container">
      <h1>Music Library</h1>

      {/* Search input */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by artist, lyrics, or writer..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Display filtered results with a limit on visible artists */}
      {Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist) => (
        <div key={artist} className="artist-section">
          <h2>{artist}</h2>
          <div className="lyrics-grid">
            {filteredLyrics[artist].map((lyric) => (
              <div key={lyric.id} className="lyric-card">
                <div className="lyric-card-content">
                  <h3>{lyric.title}</h3>
                  <p className="small-text">Published: {new Date(lyric.published_date).getFullYear()}</p>
                  <Link to={`/lyrics/${lyric.id}`} className="view-lyrics-button">View Lyrics</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* "View More" button to load more artists */}
      {Object.keys(filteredLyrics).length > visibleArtists && (
        <div className="view-more-container">
          <button onClick={loadMoreArtists} className="view-more-button">View More Artists</button>
        </div>
      )}
    </div>
  );
};

export default LyricsList;
