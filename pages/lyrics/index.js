// File: pages/lyricslist/index.jsx

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from './style/LyricsList.module.css';

// Component for the main page
const LyricsList = ({ initialLyrics, initialLanguages, initialYearRanges }) => {
  const [lyricsByArtist, setLyricsByArtist] = useState(initialLyrics || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [availableLanguages] = useState(initialLanguages);
  const [availableYearRanges] = useState(initialYearRanges);
  const [visibleArtists, setVisibleArtists] = useState(10);
  const loadMoreRef = useRef(null);

  // Corrected useEffect with an empty dependency array for the IntersectionObserver
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
  }, []); // Empty dependency array ensures this effect runs only once on mount.

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

  const pageTitle = "Music Library - Dynabeat: Explore Nepali Lyrics";
  const pageDescription = "Explore and read lyrics from our extensive music library, searchable by artist, song title, and more. Find classic and new songs by your favorite Nepali artists.";
  const canonicalUrl = "https://pandeykapil.com.np/lyrics";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicPlaylist",
              "name": pageTitle,
              "description": pageDescription,
              "url": canonicalUrl,
              "image": "https://pandeykapil.com.np/images/logo.png", // Replace with your actual logo
              "creator": {
                "@type": "Person",
                "name": "Dynabeat"
              },
              "numTracks": Object.values(initialLyrics).flat().length,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
              }
            })
          }}
        />
      </Head>

      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

      <main className={styles.lyricsListContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dynabeat Music Library</h1>
          <p className={styles.subtitle}>Discover lyrics, artists, and music across different eras.</p>
        </div>

        {/* Search and filter inputs */}
        <div className={styles.searchFilterContainer}>
          <input
            type="text"
            placeholder="Search by artist or song title..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />

          {/* Filter by language */}
          <div className={styles.filterGroup}>
            <label htmlFor="language-filter" className={styles.filterLabel}>Language:</label>
            <select
              id="language-filter"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className={styles.selectDropdown}
            >
              <option value="all">All</option>
              {availableLanguages.map((lang, idx) => (
                <option key={idx} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by year */}
          <div className={styles.filterGroup}>
            <label htmlFor="year-filter" className={styles.filterLabel}>Year:</label>
            <select
              id="year-filter"
              value={yearFilter === 'all' ? 'all' : yearFilter.label}
              onChange={(e) => {
                const selectedRange = availableYearRanges.find((range) => range.label === e.target.value);
                setYearFilter(selectedRange || 'all');
              }}
              className={styles.selectDropdown}
            >
              <option value="all">All</option>
              {availableYearRanges.map((range, idx) => (
                <option key={idx} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display filtered results */}
        {Object.keys(filteredLyrics).length > 0 ? (
          <section className={styles.contentSection}>
            {Object.keys(filteredLyrics).slice(0, visibleArtists).map((artist) => (
              <div key={artist} className={styles.artistSection}>
                <h2 className={styles.artistTitle}>{artist}</h2>
                <div className={styles.lyricsGrid}>
                  {filteredLyrics[artist].map((lyric) => (
                    <div key={lyric.slug} className={styles.lyricCard}>
                      {lyric.thumbnail_url && (
                        <Image
                          src={lyric.thumbnail_url.trim()}
                          alt={`${lyric.title} thumbnail`}
                          className={styles.thumbnail}
                          width={150}
                          height={150}
                          loading="lazy"
                        />
                      )}
                      <div className={styles.lyricCardContent}>
                        <h3 className={styles.songTitle}>{lyric.title}</h3>
                        <p className={styles.smallText}>
                          <span className={styles.infoLabel}>Published:</span>{" "}
                          {lyric.published_date ? new Date(lyric.published_date).getFullYear() : 'N/A'}
                        </p>
                        <Link href={`/viewlyrics/${lyric.slug}`} className={styles.viewLyricsButton}>
                          View Lyrics
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className={styles.noLyricsMessage}>
            <p>
              No lyrics available at the moment for your selected filters. The admin will add these lyrics shortly.
            </p>
            <p>You can help by submitting lyrics. Please contact us.</p>
          </div>
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
      </main>
    </>
  );
};

export const getStaticProps = async () => {
  const getYearRanges = (years) => {
    const ranges = [
      { label: '1970-1980', min: 1970, max: 1980 },
      { label: '1980-1990', min: 1980, max: 1990 },
      { label: '1990-2000', min: 1990, max: 2000 },
      { label: '2000-2010', min: 2000, max: 2010 },
      { label: '2010-2020', min: 2010, max: 2020 },
      { label: '2020-present', min: 2020, max: new Date().getFullYear() + 1 },
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

    const languages = [...new Set(data.map((lyric) => lyric.language.trim().toLowerCase()))].sort();
    const years = data.map((lyric) => new Date(lyric.published_date).getFullYear());
    const yearRanges = getYearRanges(years);

    return {
      props: {
        initialLyrics: groupedByArtist,
        initialLanguages: languages,
        initialYearRanges: yearRanges,
      },
      // ISR - Revalidate the page every 60 seconds
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching lyrics:', error.message);
    return {
      props: {
        initialLyrics: {},
        initialLanguages: [],
        initialYearRanges: [],
      },
      revalidate: 60,
    };
  }
};

export default LyricsList;