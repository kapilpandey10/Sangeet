import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link'; // Use Next.js Link for routing
import styles from './style/LyricsList.module.css'; // Use CSS Module for styling

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
    document.title = 'Dynabeat | Nepali Music Digital Library for Song Lyrics';

    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('title, artist, published_date, slug, language, added_by, status')
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
        console.error('Error fetching lyrics:', error.message);
        setError('Failed to load lyrics.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchLyrics();
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
    <div className={styles.skeletonLoader}>
      <div className={styles.skeletonTitle}></div>
      <p></p>
      <div className={styles.skeletonCard}></div>
      <div className={styles.skeletonCard}></div>
      <p></p>
      <div className={styles.skeletonCard}></div>
      <div className={styles.skeletonCard}></div>
    </div>
  );

  if (loading) return renderSkeletonLoader(); // Render skeleton loader during loading
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return (
    <div className={styles.lyricsListContainer}>
      <h1>Music Library</h1>

      {/* Square Ad */}
      <div className={styles.squareAd}>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-9887409333966239"
             data-ad-slot="1039665871"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>

      {/* Search and filter inputs */}
      <div className={styles.searchFilterContainer}>
        <input
          type="text"
          placeholder="Search by artist, lyrics, or writer..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        {/* Filter by language */}
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className={styles.selectDropdown}
        >
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
          className={styles.selectDropdown}
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
      {Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist) => (
        <div key={artist} className={styles.artistSection}>
          <h2>{artist}</h2>

          <div className={styles.lyricsGrid}>
            {filteredLyrics[artist].map((lyric) => (
              <div key={lyric.slug} className={styles.lyricCard}>
                <div className={styles.lyricCardContent}>
                  <h3>{lyric.title}</h3>
                  <p className={styles.smallText}>Published: {new Date(lyric.published_date).getFullYear()}</p>
                  <Link href={`/lyrics/${lyric.slug}`} className={styles.viewLyricsButton}>
                    View Lyrics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Load More Button */}
      <div ref={loadMoreRef} className={styles.viewMoreContainer}>
        <button onClick={() => setVisibleArtists((prev) => prev + 10)} className={styles.viewMoreButton}>
          Load More
        </button>
      </div>

      {/* Additional Ads */}
      <div className={styles.squareAd}>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-9887409333966239"
             data-ad-slot="1039665871"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>

    </div>
  );
};

export default LyricsList;
