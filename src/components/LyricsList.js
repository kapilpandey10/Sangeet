import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../style/LyricsList.css'; // Your CSS file for styling

const LyricsList = () => {
  const [lyricsByArtist, setLyricsByArtist] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableYearRanges, setAvailableYearRanges] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading state
  const [error, setError] = useState(null);
  const [visibleArtists, setVisibleArtists] = useState(10); // For "Load More" functionality

  const loadMoreRef = useRef(null);

  useEffect(() => {
    document.title = 'Sangeet Lyrics Central | Nepali Music Digital Library for Song Lyrics';

    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('title, artist, published_date, slug, language')
          .eq('status', 'approved')
          .order('published_date', { ascending: false });

        if (error) throw error;

        const groupedByArtist = data.reduce((result, lyric) => {
          const artists = lyric.artist.split(',').map((artist) => artist.trim());
          artists.forEach((artist) => {
            if (!result[artist]) result[artist] = [];
            result[artist].push(lyric);
          });
          return result;
        }, {});

        setLyricsByArtist(groupedByArtist);

        const languages = [...new Set(data.map((lyric) => lyric.language.trim().toLowerCase()))];
        setAvailableLanguages(languages);

        const years = data.map((lyric) => new Date(lyric.published_date).getFullYear());
        const yearRanges = getYearRanges(years);
        setAvailableYearRanges(yearRanges);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setError('Failed to load lyrics.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchLyrics();
  }, []);

  useEffect(() => {
    // Initialize Google Auto Ads
    const initializeAds = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', 'ca-pub-9887409333966239');
      document.body.appendChild(script);
    };

    initializeAds(); // Load the Auto Ads script when the component is mounted
  }, []);

  const getYearRanges = (years) => {
    const ranges = [
      { label: '1970-1980', min: 1970, max: 1980 },
      { label: '1980-1990', min: 1980, max: 1990 },
      { label: '1990-2000', min: 1990, max: 2000 },
      { label: '2000-2010', min: 2000, max: 2010 },
      { label: '2010-2020', min: 2010, max: 2020 },
      { label: '2020-present', min: 2020, max: new Date().getFullYear() },
    ];
    return ranges.filter((range) => years.some((year) => year >= range.min && year < range.max));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredLyrics = Object.keys(lyricsByArtist).reduce((filtered, artist) => {
    const filteredByArtist = lyricsByArtist[artist].filter((lyric) => {
      const matchesSearchQuery =
        lyric.title.toLowerCase().includes(searchQuery) ||
        lyric.artist.toLowerCase().includes(searchQuery);

      const matchesLanguage =
        languageFilter === 'all' || lyric.language.trim().toLowerCase() === languageFilter.toLowerCase();

      const matchesYear =
        yearFilter === 'all' ||
        (new Date(lyric.published_date).getFullYear() >= yearFilter.min &&
          new Date(lyric.published_date).getFullYear() < yearFilter.max);

      return matchesSearchQuery && matchesLanguage && matchesYear;
    });

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  // Render the skeleton loader while loading
  const renderSkeletonLoader = () => (
    <div className="skeleton-loader">
      <div className="skeleton-title"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
    </div>
  );

  if (loading) return renderSkeletonLoader(); // Render skeleton loader during loading
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
          {availableLanguages.map((lang, idx) => (
            <option key={idx} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>

        {/* Filter by year */}
        <select
          value={yearFilter === 'all' ? 'all' : yearFilter.label}
          onChange={(e) => {
            const selectedRange = availableYearRanges.find((range) => range.label === e.target.value);
            setYearFilter(selectedRange || 'all');
          }}
        >
          <option value="all">All Years</option>
          {availableYearRanges.map((range, idx) => (
            <option key={idx} value={range.label}>
              {range.label}
            </option>
          ))}
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

      {/* Placeholder for Google Auto Ads */}
      <div className="google-auto-ads">
        {/* Google Ads can be inserted here */}
      </div>
    </div>
  );
};

export default LyricsList;
