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
  const [visibleArtists, setVisibleArtists] = useState(10);
  const [limit, setLimit] = useState(10);

  const loadMoreRef = useRef(null);

  useEffect(() => {
    document.title = 'Sangeet Lyrics Central | Nepali Music Digital Library for Song Lyrics';

    // Set meta tags for SEO (Add/remove as per your website's requirements)
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Discover the latest Nepali music lyrics, including popular and classic hits. Sangeet Lyrics Central offers a vast collection of Nepali music lyrics.';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'Nepali music lyrics, Nepali artists, songs, Sangeet Lyrics Central, latest Nepali songs, Balen, Nepali Music industry';
    document.head.appendChild(metaKeywords);

    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
      document.head.removeChild(metaRobots);
    };
  }, []);

  useEffect(() => {
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('status', 'approved')
          .order('published_date', { ascending: false });

        if (error) throw error;

        const groupedByArtist = data.reduce((result, lyric) => {
          const artists = lyric.artist.split(',').map(artist => artist.trim());
          artists.forEach(artist => {
            if (!result[artist]) result[artist] = [];
            result[artist].push(lyric);
          });
          return result;
        }, {});

        setLyricsByArtist(groupedByArtist);
      } catch (error) {
        setError('Failed to load lyrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, []);

  // Search and filter functions
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const generateSlug = (title) => {
    return title.trim().replace(/\s+/g, '_').toLowerCase();
  };

  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter(lyric => {
      const matchesSearchQuery = lyric.title.toLowerCase().includes(searchQuery)
        || lyric.artist.toLowerCase().includes(searchQuery)
        || lyric.lyrics.toLowerCase().includes(searchQuery);

      const matchesLanguage = languageFilter === 'all' || lyric.language.trim().toLowerCase() === languageFilter.toLowerCase();
      const matchesYear = yearFilter === 'all' || new Date(lyric.published_date).getFullYear().toString() === yearFilter;

      return matchesSearchQuery && matchesLanguage && matchesYear;
    });

    if (filteredByArtist.length > 0) filtered[artist] = filteredByArtist;
    return filtered;
  }, {});

  const uniqueLanguages = [...new Set(Object.values(lyricsByArtist).flat().map(lyric => lyric.language.trim().toLowerCase()))];
  const uniqueYears = [...new Set(Object.values(lyricsByArtist).flat().map(lyric => new Date(lyric.published_date).getFullYear()))];

  const loadMoreArtists = () => setVisibleArtists((prevVisible) => prevVisible + 10);

  // Lazy loading using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreArtists();
    }, { threshold: 1.0 });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, []);

  if (loading) return <p>Loading lyrics...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="lyrics-list-container">
      <h1>Music Library</h1>

      {/* Search and Filter Inputs */}
      <div className="search-filter-container" role="search">
        <label htmlFor="search-input" className="visually-hidden">Search for lyrics</label>
        <input
          type="text"
          id="search-input"
          placeholder="Search by artist, lyrics, or writer..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
          aria-label="Search by artist, lyrics, or writer"
        />

        <label htmlFor="language-filter" className="visually-hidden">Filter by language</label>
        <select
          id="language-filter"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          aria-label="Filter by language"
        >
          <option value="all">All Languages</option>
          {uniqueLanguages.map((lang, idx) => (
            <option key={idx} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
          ))}
        </select>

        <label htmlFor="year-filter" className="visually-hidden">Filter by year</label>
        <select
          id="year-filter"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          aria-label="Filter by year"
        >
          <option value="all">All Years</option>
          {uniqueYears.map((year, idx) => (
            <option key={idx} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Display filtered results */}
      {Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist) => (
        <div key={artist} className="artist-section">
          <h2>{artist}</h2>
          <div className="lyrics-grid">
            {filteredLyrics[artist].map((lyric) => (
              <div key={lyric.id} className="lyric-card" role="article">
                <h3>{lyric.title}</h3>
                <p>By {lyric.artist}</p>
                <p>Published: {new Date(lyric.published_date).getFullYear()}</p>
                <Link to={`/lyrics/${generateSlug(lyric.title)}`} aria-label={`View lyrics for ${lyric.title}`}>
                  View Lyrics
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Load More Artists */}
      <div ref={loadMoreRef} className="view-more-container">
        <button onClick={loadMoreArtists} className="view-more-button" aria-live="polite">
          Load More
        </button>
      </div>
    </div>
  );
};

export default LyricsList;
