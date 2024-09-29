import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../style/LyricsList.css'; // Your CSS file for styling

const LyricsList = () => {
  const [lyricsByArtist, setLyricsByArtist] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleArtists, setVisibleArtists] = useState(10); // For "Load More" functionality

  const loadMoreRef = useRef(null);

  useEffect(() => {
    document.title = 'Sangeet Lyrics Central | Nepali Music Digital Library for Song Lyrics';

    const fetchLyrics = async () => {
      try {
        // Fetch slug along with other fields
        const { data, error } = await supabase
          .from('lyrics')
          .select('title, artist, published_date, slug')  // Ensure slug is selected
          .eq('status', 'approved') // Only fetch approved lyrics
          .order('published_date', { ascending: false }); // Fetch latest songs first

        if (error) throw error;

        // Group lyrics by artist
        const groupedByArtist = data.reduce((result, lyric) => {
          const artists = lyric.artist.split(',').map((artist) => artist.trim());
          artists.forEach((artist) => {
            if (!result[artist]) result[artist] = [];
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

  // Search function
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter results based on search query, language, and year
  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter((lyric) => {
      const matchesSearchQuery =
        lyric.title.toLowerCase().includes(searchQuery) ||
        lyric.artist.toLowerCase().includes(searchQuery);

      const matchesLanguage =
        languageFilter === 'all' || lyric.language.trim().toLowerCase() === languageFilter.toLowerCase();
      const matchesYear = yearFilter === 'all' || new Date(lyric.published_date).getFullYear().toString() === yearFilter;

      return matchesSearchQuery && matchesLanguage && matchesYear;
    });

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  if (loading) return <p>Loading lyrics...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="lyrics-list-container">
      <h1>Music Library</h1>

      {/* Search and filter inputs */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by artist, lyrics, or writer..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />

        {/* Filter by language */}
        <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
          <option value="all">All Languages</option>
          {/* You can populate languages here */}
        </select>

        {/* Filter by year */}
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          {/* You can populate years here */}
        </select>
      </div>

      {/* Display filtered results */}
      {Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist, index) => (
        <div key={artist} className="artist-section">
          <h2>{artist}</h2>
          <div className="lyrics-grid">
            {filteredLyrics[artist].map((lyric) => (
              <div key={lyric.slug} className="lyric-card">
                <div className="lyric-card-content">
                  <h3>{lyric.title}</h3>
                  <p className="small-text">Published: {new Date(lyric.published_date).getFullYear()}</p>
                  {/* Use the slug for the Link */}
                  <Link to={`/lyrics/${lyric.slug}`} className="view-lyrics-button">
                    View Lyrics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Load More Button */}
      <div ref={loadMoreRef} className="view-more-container">
        <button onClick={() => setVisibleArtists((prev) => prev + 10)} className="view-more-button">
          Load More
        </button>
      </div>
    </div>
  );
};

export default LyricsList;
