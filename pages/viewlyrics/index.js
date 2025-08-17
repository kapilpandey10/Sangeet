// File: pages/lyricslist/index.jsx

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from './style/LyricsList.module.css';

const LyricsList = ({ initialLyrics, initialLanguages, initialYearRanges }) => {
  const [lyricsByArtist, setLyricsByArtist] = useState(initialLyrics || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [availableLanguages] = useState(initialLanguages);
  const [availableYearRanges] = useState(initialYearRanges);
  const [visibleArtists, setVisibleArtists] = useState(10);
  const loadMoreRef = useRef(null);

  // Effect to handle "Load More" visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleArtists((prev) => prev + 10);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMoreLyrics]);

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

      const publishedYear = lyric.published_date ? new Date(lyric.published_date).getFullYear() : null;
      const matchesYear =
        yearFilter === 'all' ||
        (publishedYear && publishedYear >= yearFilter.min && publishedYear < yearFilter.max);

      return matchesSearchQuery && matchesLanguage && matchesYear;
    });

    if (filteredByArtist.length > 0) {
      filtered[artist] = filteredByArtist;
    }

    return filtered;
  }, {});

  const hasMoreLyrics = Object.keys(filteredLyrics).length > visibleArtists;

  return (
    <>
      <Head>
        <title>Music Library - Dynabeat</title>
        <meta name="description" content="Explore and read lyrics from our extensive music library, searchable by artist, song title, and more." />
        <link rel="canonical" href="https://pandeykapil.com.np/lyrics" />
      </Head>

      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

      <div className={styles.lyricsListContainer}>
        <h1>Music Library</h1>

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
        {Object.keys(filteredLyrics).length > 0 ? (
          Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist) => (
            <div key={artist} className={styles.artistSection}>
              <h2>{artist}</h2>

              <div className={styles.lyricsGrid}>
                {filteredLyrics[artist].map((lyric) => (
                  <div key={lyric.slug} className={styles.lyricCard}>
                    {lyric.thumbnail_url && (
                      <Image
                        src={lyric.thumbnail_url.trim()} // Corrected with .trim()
                        alt={`${lyric.title} thumbnail`}
                        className={styles.thumbnail}
                        width={150}
                        height={150}
                        loading="lazy"
                      />
                    )}
                    <div className={styles.lyricCardContent}>
                      <h3>{lyric.title}</h3>
                      <p className={styles.smallText}>Published: {lyric.published_date ? new Date(lyric.published_date).getFullYear() : 'N/A'}</p>
                      <Link href={`/viewlyrics/${lyric.slug}`} className={styles.viewLyricsButton}>
                        View Lyrics
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noLyricsMessage}>
            No lyrics available at the moment. The admin will add these lyrics shortly. You can help by submitting the lyrics. Please contact us.
          </p>
        )}

        {/* "Load More" functionality with a button */}
        {hasMoreLyrics && (
          <div ref={loadMoreRef} className={styles.viewMoreContainer}>
            <button
              onClick={() => setVisibleArtists((prev) => prev + 10)}
              className={styles.viewMoreButton}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps = async () => {
  const getYearRanges = (years) => {
    const ranges = [
      { label: '1970-1980', min: 1970, max: 1980 },
      { label: '1980-1990', min: 1980, max: 1990 },
      { label: '1990-2000', min: 1990, max: 2000 },
      { label: '2000-2010', min: 2000, max: 2010 },
      { label: '2010-2020', min: 2010, max: 2020 },
      { label: '2020-present', min: 2020, max: new Date().getFullYear() + 1 }, // Added +1 to include the current year
    ];
    return ranges.filter((range) => years.some((year) => year >= range.min && year < range.max));
  };

  try {
    const { data, error } = await supabase
      .from('lyrics')
      .select('title, artist, published_date, slug, language, thumbnail_url, added_by, status')
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

    const languages = [...new Set(data.map((lyric) => lyric.language.trim().toLowerCase()))];
    const years = data.map((lyric) => new Date(lyric.published_date).getFullYear());
    const yearRanges = getYearRanges(years);

    return {
      props: {
        initialLyrics: groupedByArtist,
        initialLanguages: languages,
        initialYearRanges: yearRanges,
      },
    };
  } catch (error) {
    console.error('Error fetching lyrics:', error.message);
    return {
      props: {
        initialLyrics: {},
        initialLanguages: [],
        initialYearRanges: [],
      },
    };
  }
};

export default LyricsList;