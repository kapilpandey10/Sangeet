import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FaSearch, FaGoogle, FaFire, FaRandom, FaTimes, FaMusic, FaHeadphones } from 'react-icons/fa';
import styles from './style/LyricsList.module.css';

// ── Floating particle background ─────────────────────────────
const Particles = () => {
  const notes = ['♪', '♫', '♩', '♬', '𝄞'];
  return (
    <div className={styles.particles} aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className={styles.particle}
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            animationDelay: `${(i * 0.7) % 9}s`,
            animationDuration: `${12 + (i % 6) * 2}s`,
            fontSize: `${0.7 + (i % 4) * 0.25}rem`,
            opacity: 0.06 + (i % 3) * 0.03,
          }}
        >
          {notes[i % notes.length]}
        </span>
      ))}
    </div>
  );
};

// ── Single music card ─────────────────────────────────────────
const MusicCard = ({ song, index }) => (
  <Link
    href={`/viewlyrics/${song.slug}`}
    className={styles.musicCard}
    style={{ animationDelay: `${index * 0.06}s` }}
  >
    <div className={styles.cardThumb}>
      <Image
        src={song.thumbnail_url?.trim() || '/logo/logo.webp'}
        alt={song.title}
        width={220}
        height={220}
        className={styles.cardImg}
      />
      <div className={styles.cardOverlay}>
        <div className={styles.playRing}>
          <span className={styles.playIcon}>▶</span>
        </div>
      </div>
      <div className={styles.cardShine} />
    </div>
    <div className={styles.cardBody}>
      <h3 className={styles.cardTitle}>{song.title}</h3>
      <p className={styles.cardArtist}>{song.artist}</p>
    </div>
  </Link>
);

// ── Compact row for Quick Discovery ──────────────────────────
const CompactRow = ({ song, index }) => (
  <Link
    href={`/viewlyrics/${song.slug}`}
    className={styles.compactRow}
    style={{ animationDelay: `${index * 0.08}s` }}
  >
    <div className={styles.compactThumbWrap}>
      <Image
        src={song.thumbnail_url?.trim() || '/logo/logo.webp'}
        alt={song.title}
        width={68}
        height={68}
        className={styles.compactThumb}
      />
      <div className={styles.compactGlow} />
    </div>
    <div className={styles.compactInfo}>
      <h4 className={styles.compactTitle}>{song.title}</h4>
      <p className={styles.compactArtist}>{song.artist}</p>
    </div>
    <div className={styles.compactArrow}>›</div>
  </Link>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const LyricsLibrary = ({ allLyrics }) => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [focused, setFocused]           = useState(false);
  const [mounted, setMounted]           = useState(false);
  const inputRef                        = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const topSearches = useMemo(() => (allLyrics ? allLyrics.slice(0, 12) : []), [allLyrics]);

  const randomDiscovery = useMemo(() =>
    allLyrics ? [...allLyrics].sort(() => 0.5 - Math.random()).slice(0, 6) : [],
  [allLyrics]);

  const filteredLyrics = useMemo(() =>
    allLyrics.filter(l =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [allLyrics, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className={`${styles.page} ${mounted ? styles.mounted : ''}`}>
      <Head>
        <title>DynaBeat Library | Explore Lyrics</title>
        <meta name="description" content="Discover, search and explore music lyrics from every genre and language." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <header className={styles.hero}>
        <Particles />

        {/* Mesh gradient blobs */}
        <div className={styles.blob1} aria-hidden />
        <div className={styles.blob2} aria-hidden />
        <div className={styles.blob3} aria-hidden />

        <div className={styles.heroInner}>
          {/* Eyebrow */}
          <div className={styles.eyebrow}>
            <FaHeadphones />
            <span>DynaBeat · Global Music Library</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine1}>Discover</span>
            <span className={styles.heroLine2}>Every <em>Lyric.</em></span>
          </h1>

          <p className={styles.heroSub}>
            {allLyrics.length.toLocaleString()}+ songs — every genre, every language, every era.
          </p>

          {/* Search bar */}
          <div className={`${styles.searchBar} ${focused ? styles.searchFocused : ''}`}>
            <FaSearch className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Song title, artist name…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={styles.searchInput}
              autoComplete="off"
              spellCheck={false}
            />
            {searchTerm && (
              <button className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                <FaTimes />
              </button>
            )}
            <div className={styles.searchGlow} />
          </div>

          {/* Stat pills */}
          <div className={styles.statRow}>
            <span className={styles.statPill}><FaFire /> Trending now</span>
            <span className={styles.statPill}><FaMusic /> New this week</span>
            <span className={styles.statPill}><FaRandom /> Random pick</span>
          </div>
        </div>

        <div className={styles.heroDivider} aria-hidden />
      </header>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className={styles.main}>

        {/* ── No search: show discovery sections ─────────────── */}
        {!searchTerm ? (
          <>
            {/* TOP SEARCHES */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionLabel}>
                  <FaFire className={styles.labelIcon} style={{ color: '#ff4458' }} />
                  <span>Top Searches</span>
                </div>
                <span className={styles.sectionSub}>This week's most visited</span>
              </div>

              <div className={styles.cardGrid}>
                {topSearches.map((song, i) => (
                  <MusicCard key={song.slug} song={song} index={i} />
                ))}
              </div>
            </section>

            {/* QUICK DISCOVERY */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionLabel}>
                  <FaRandom className={styles.labelIcon} style={{ color: '#818cf8' }} />
                  <span>Quick Discovery</span>
                </div>
                <span className={styles.sectionSub}>Handpicked for you</span>
              </div>

              <div className={styles.discoveryGrid}>
                {randomDiscovery.map((song, i) => (
                  <CompactRow key={song.slug} song={song} index={i} />
                ))}
              </div>
            </section>
          </>
        ) : (
          /* ── SEARCH RESULTS ──────────────────────────────── */
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionLabel}>
                <FaSearch className={styles.labelIcon} />
                <span>Results for "{searchTerm}"</span>
              </div>
              <span className={styles.sectionSub}>
                {filteredLyrics.length} {filteredLyrics.length === 1 ? 'song' : 'songs'} found
              </span>
            </div>

            {filteredLyrics.length > 0 ? (
              <div className={styles.cardGrid}>
                {filteredLyrics.map((song, i) => (
                  <MusicCard key={song.slug} song={song} index={i} />
                ))}
              </div>
            ) : (
              /* ── NO RESULTS ─────────────────────────────── */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FaMusic />
                </div>
                <h3 className={styles.emptyTitle}>Not in our library yet</h3>
                <p className={styles.emptyText}>
                  We couldn't find <strong>"{searchTerm}"</strong> — but Google might.
                </p>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' lyrics')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.googleBtn}
                >
                  <FaGoogle />
                  Search on Google
                </a>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
};

// ─── Data fetching ────────────────────────────────────────────
export const getStaticProps = async () => {
  try {
    const { data, error } = await supabase
      .from('lyrics')
      .select('title, artist, slug, thumbnail_url, status')
      .eq('status', 'approved')
      .order('published_date', { ascending: false });

    if (error) throw error;
    return { props: { allLyrics: data || [] }, revalidate: 60 };
  } catch (error) {
    console.error('Data fetch error:', error);
    return { props: { allLyrics: [] }, revalidate: 60 };
  }
};

export default LyricsLibrary;