import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../style/LyricsList.css';

const LyricsList = () => {
  const [lyricsByArtist, setLyricsByArtist] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [decadeFilter, setDecadeFilter] = useState('all'); // Decade filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleArtists, setVisibleArtists] = useState(10); // For "Load More" functionality

  useEffect(() => {
    const dynamicTitle = searchQuery
      ? `Search Results for "${searchQuery}" | Sangeet Lyrics Central`
      : 'Nepali Song Lyrics Library | Sangeet Lyrics Central';

    const dynamicDescription = searchQuery
      ? `Search results for "${searchQuery}" in Nepali songs. Discover lyrics from artists like 1974 AD, Sushant KC, Narayan Gopal, and more.`
      : 'Explore a vast collection of Nepali song lyrics from various artists. Find lyrics from popular Nepali songs and artists, including the latest hits.';

    document.title = dynamicTitle;

    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    metaDescription.content = dynamicDescription;
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = "keywords";
    metaKeywords.content = `Nepali song lyrics, ${searchQuery}, Nepali artists, Nepali music, popular Nepali lyrics, Sangeet Lyrics Central`;
    document.head.appendChild(metaKeywords);

    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('status', 'approved') // Only fetch approved lyrics
          .order('published_date', { ascending: false }); // Fetch latest songs first

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

  // Function to generate URL slugs for title and artist
  const generateSlug = (title) => {
    return title.trim().replace(/\s+/g, '_').toLowerCase(); // Replaces spaces with underscores and converts to lowercase
  };

  // Filter results based on search query, language, and decade of publication
  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter(lyric => {
      const matchesSearchQuery = lyric.title.toLowerCase().includes(searchQuery) ||
        lyric.artist.toLowerCase().includes(searchQuery) ||
        (lyric.lyrics_writer && lyric.lyrics_writer.toLowerCase().includes(searchQuery)) ||
        lyric.lyrics.toLowerCase().includes(searchQuery); // Search within lyrics

      const matchesLanguage = languageFilter === 'all' || lyric.language.trim().toLowerCase() === languageFilter.toLowerCase();
      const matchesDecade = decadeFilter === 'all' || Math.floor(new Date(lyric.published_date).getFullYear() / 10) * 10 === parseInt(decadeFilter);

      return matchesSearchQuery && matchesLanguage && matchesDecade;
    });

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  // Get unique languages for filtering
  const uniqueLanguages = [...new Set(Object.values(lyricsByArtist).flat().map(lyric => lyric.language.trim().toLowerCase()))]; // Trim and lowercase to avoid duplicates

  const decades = ['1970', '1980', '1990', '2000', '2010', '2020'];

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

      {/* Filter by language and decade */}
      <div className="filter-bar">
        <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
          <option value="all">All Languages</option>
          {uniqueLanguages.map((lang, idx) => (
            <option key={idx} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option> // Capitalize first letter
          ))}
        </select>

        <select value={decadeFilter} onChange={(e) => setDecadeFilter(e.target.value)}>
          <option value="all">All Decades</option>
          {decades.map((decade, idx) => (
            <option key={idx} value={decade}>{decade + "'s"}</option>
          ))}
        </select>
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
                  <Link to={`/lyrics/${generateSlug(lyric.title)}`} className="view-lyrics-button">
                    View Lyrics
                  </Link>
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
