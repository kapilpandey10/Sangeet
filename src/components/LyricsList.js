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
  const [limit, setLimit] = useState(10); // Initial number of artists visible

  const loadMoreRef = useRef(null);

  // Fetch lyrics from Supabase when the component mounts
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

        // Group lyrics by artist
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

  // Search function
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Function to generate URL slugs for title and artist
  const generateSlug = (title) => {
    return title.trim().replace(/\s+/g, '_').toLowerCase(); // Replaces spaces with underscores and converts to lowercase
  };

  // Filter results based on search query, language, and year
  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter(lyric => {
      const matchesSearchQuery = lyric.title.toLowerCase().includes(searchQuery) ||
        lyric.artist.toLowerCase().includes(searchQuery) ||
        lyric.lyrics.toLowerCase().includes(searchQuery);

      const matchesLanguage = languageFilter === 'all' || lyric.language.trim().toLowerCase() === languageFilter.toLowerCase();
      const matchesYear = yearFilter === 'all' || new Date(lyric.published_date).getFullYear().toString() === yearFilter;

      return matchesSearchQuery && matchesLanguage && matchesYear;
    });

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  // Get unique languages and years for dropdown filters
  const uniqueLanguages = [...new Set(Object.values(lyricsByArtist).flat().map(lyric => lyric.language.trim().toLowerCase()))];
  const uniqueYears = [...new Set(Object.values(lyricsByArtist).flat().map(lyric => new Date(lyric.published_date).getFullYear()))];

  // "Load More" functionality to display more artists
  const loadMoreArtists = () => {
    setVisibleArtists((prevVisible) => prevVisible + 10);
  };

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreArtists(); // Load more lyrics when the observer intersects
        }
      },
      { threshold: 1.0 } // Trigger when 100% of the element is visible
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, []);

  if (loading) {
    return <p>Loading lyrics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="lyrics-list-container">
      <h1>Music Library</h1>

      {/* Search and filter inputs */}
      <div className="search-filter-container">
        {/* Search input */}
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
          {uniqueLanguages.map((lang, idx) => (
            <option key={idx} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
          ))}
        </select>

        {/* Filter by year */}
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          {uniqueYears.map((year, idx) => (
            <option key={idx} value={year}>{year}</option>
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

      {/* Load More Button */}
      <div ref={loadMoreRef} className="view-more-container">
        <button onClick={loadMoreArtists} className="view-more-button">Load More</button>
      </div>
    </div>
  );
};

export default LyricsList;
