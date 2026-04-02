import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import {
  FaSearch, FaGoogle, FaTimes, FaMusic,
  FaHeadphones, FaFire, FaPlay, FaQuoteLeft,
  FaChevronRight, FaRegClock, FaStar, FaEye,
  FaShare, FaCheck,
} from 'react-icons/fa';
import styles from './style/LyricsList.module.css';

// ─── AdSense config ──────────────────────────────────────────
const ADSENSE_CLIENT = 'ca-pub-9887409333966239';
const AD_SLOTS = {
  AFTER_HERO:     '9654430713',
  MID_PAGE:       '1815265882',
  BEFORE_ARTISTS: '3280594056',
  BOTTOM:         '7959039819',
};

const pushAd = () => {
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
};

// ─── Track click count via Supabase RPC ──────────────────────
const trackClick = async (id) => {
  try {
    await supabase.rpc('increment_click_count', { song_id: id });
  } catch (_) {}
};

// ─── Format large numbers ────────────────────────────────────
const formatCount = (n) => {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

// ─── Recently viewed (localStorage) ─────────────────────────
const RECENT_KEY = 'dynabeat_recent';
const MAX_RECENT = 6;

const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch { return []; }
};

const addRecent = (song) => {
  try {
    const prev = getRecent().filter(s => s.slug !== song.slug);
    const next = [{ slug: song.slug, title: song.title, artist: song.artist, thumbnail_url: song.thumbnail_url }, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
};

// ─── Inline Ad Banner ────────────────────────────────────────
const AdBanner = ({ slotId, label = 'Advertisement' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    pushAd();
    const t = setTimeout(() => {
      if (!ref.current) return;
      const s = ref.current.getAttribute('data-ad-status');
      if (!s || s === 'unfilled') setVisible(false);
    }, 2500);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className={styles.adBanner}>
      <span className={styles.adLabel}>{label}</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// ─── Floating particles ──────────────────────────────────────
const Particles = () => {
  const notes = ['♪', '♫', '♩', '♬', '𝄞'];
  return (
    <div className={styles.particles} aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className={styles.particle} style={{
          left: `${(i * 19 + 3) % 100}%`,
          animationDelay: `${(i * 0.8) % 10}s`,
          animationDuration: `${13 + (i % 5) * 2}s`,
          fontSize: `${0.65 + (i % 4) * 0.22}rem`,
          opacity: 0.05 + (i % 3) * 0.03,
        }}>{notes[i % notes.length]}</span>
      ))}
    </div>
  );
};

// ─── Skeleton loader ─────────────────────────────────────────
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} style={{ width: '75%' }} />
      <div className={styles.skeletonLine} style={{ width: '50%', opacity: 0.5 }} />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className={styles.skeletonRow}>
    <div className={styles.skeletonRank} />
    <div className={styles.skeletonThumbSm} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} style={{ width: '65%' }} />
      <div className={styles.skeletonLine} style={{ width: '40%', opacity: 0.5 }} />
    </div>
  </div>
);

// ─── Section divider with label ──────────────────────────────
const SectionHead = ({ icon, title, sub, action, actionHref }) => (
  <div className={styles.sectionHead}>
    <div className={styles.sectionLabel}>
      <span className={styles.sectionIcon}>{icon}</span>
      <span>{title}</span>
    </div>
    <div className={styles.sectionRight}>
      {sub && <span className={styles.sectionSub}>{sub}</span>}
      {action && actionHref && (
        <Link href={actionHref} className={styles.viewAll}>
          {action} <FaChevronRight style={{ fontSize: '0.6rem' }} />
        </Link>
      )}
    </div>
  </div>
);

// ─── Featured Hero Song Card ─────────────────────────────────
const FeaturedCard = ({ song }) => {
  if (!song) return null;
  const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';
  const preview = song.lyrics
    ? song.lyrics.slice(0, 220).split('\n').slice(0, 6).join('\n')
    : 'No preview available.';
  const count = formatCount(song.click_count);

  const handleClick = () => {
    trackClick(song.id);
    addRecent(song);
  };

  return (
    <Link href={`/viewlyrics/${song.slug}`} className={styles.featuredCard} onClick={handleClick}>
      <div className={styles.featuredBg} style={{ backgroundImage: `url(${thumb})` }} />
      <div className={styles.featuredOverlay} />
      <div className={styles.featuredInner}>
        <div className={styles.featuredArt}>
          <Image src={thumb} alt={song.title} width={240} height={240} className={styles.featuredImg} priority />
          <div className={styles.featuredPlayBtn}><FaPlay /></div>
        </div>
        <div className={styles.featuredContent}>
          <p className={styles.featuredEyebrow}><FaStar style={{ color: '#c9a84c' }} /> Featured Lyrics</p>
          <h2 className={styles.featuredTitle}>{song.title}</h2>
          <p className={styles.featuredArtist}>{song.artist}</p>
          {count && (
            <p className={styles.featuredViews}>
              <FaEye style={{ fontSize: '0.7rem' }} /> {count} views
            </p>
          )}
          <div className={styles.lyricsPreviewWrap}>
            <FaQuoteLeft className={styles.quoteIcon} />
            <pre className={styles.lyricsPreview}>{preview}</pre>
            <div className={styles.lyricsFade} />
          </div>
          <div className={styles.featuredCta}>
            Read Full Lyrics <FaChevronRight />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Standard music card ─────────────────────────────────────
const MusicCard = ({ song, index = 0 }) => {
  const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';
  const count = formatCount(song.click_count);
  const isHot = song.click_count >= 100;

  const handleClick = () => {
    trackClick(song.id);
    addRecent(song);
  };

  return (
    <Link href={`/viewlyrics/${song.slug}`} className={styles.musicCard}
      style={{ animationDelay: `${Math.min(index * 0.055, 0.45)}s` }}
      onClick={handleClick}>
      <div className={styles.cardThumb}>
        <Image src={thumb} alt={song.title} width={220} height={220}
          className={styles.cardImg} loading={index < 8 ? 'eager' : 'lazy'} />
        <div className={styles.cardOverlay}>
          <div className={styles.playRing}><FaPlay className={styles.playIcon} /></div>
        </div>
        {isHot && <span className={styles.hotBadge}>🔥</span>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{song.title}</h3>
        <p className={styles.cardArtist}>{song.artist}</p>
        {count && (
          <p className={styles.cardViews}><FaEye style={{ fontSize: '0.55rem' }} /> {count}</p>
        )}
      </div>
    </Link>
  );
};

// ─── Trending numbered row ───────────────────────────────────
const TrendingRow = ({ song, rank }) => {
  const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';
  const count = formatCount(song.click_count);

  const handleClick = () => {
    trackClick(song.id);
    addRecent(song);
  };

  return (
    <Link href={`/viewlyrics/${song.slug}`} className={styles.trendingRow} onClick={handleClick}>
      <span className={styles.trendingRank}>{String(rank).padStart(2, '0')}</span>
      <div className={styles.trendingThumb}>
        <Image src={thumb} alt={song.title} width={56} height={56}
          className={styles.trendingImg} loading="lazy" />
      </div>
      <div className={styles.trendingInfo}>
        <h4 className={styles.trendingTitle}>{song.title}</h4>
        <p className={styles.trendingArtist}>{song.artist}</p>
      </div>
      {count && <span className={styles.trendingCount}><FaEye style={{ fontSize: '0.55rem' }} /> {count}</span>}
      <FaChevronRight className={styles.trendingArrow} />
    </Link>
  );
};

// ─── Lyric Snippet / Quote card ──────────────────────────────
const LyricQuoteCard = ({ song, colorIndex = 0 }) => {
  const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';
  const snippet = song.lyrics
    ? song.lyrics.split('\n').filter(l => l.trim().length > 15).slice(0, 2).join('\n')
    : '';
  if (!snippet) return null;

  const accents = ['#c9a84c', '#ff6b6b', '#818cf8', '#34d399', '#f59e0b'];
  const accent  = accents[colorIndex % accents.length];

  const handleClick = () => {
    trackClick(song.id);
    addRecent(song);
  };

  return (
    <Link href={`/viewlyrics/${song.slug}`} className={styles.quoteCard}
      style={{ '--qaccent': accent }} onClick={handleClick}>
      <FaQuoteLeft className={styles.quoteCardIcon} />
      <p className={styles.quoteText}>{snippet}</p>
      <div className={styles.quoteCardFoot}>
        <Image src={thumb} alt={song.artist} width={32} height={32}
          className={styles.quoteAvatar} loading="lazy" />
        <div>
          <p className={styles.quoteCardTitle}>{song.title}</p>
          <p className={styles.quoteCardArtist}>{song.artist}</p>
        </div>
      </div>
    </Link>
  );
};

// ─── Artist spotlight card ───────────────────────────────────
const ArtistCard = ({ artist, songs }) => {
  const thumb = songs[0]?.thumbnail_url?.trim() || '/logo/logo.webp';
  const totalViews = songs.reduce((acc, s) => acc + (s.click_count || 0), 0);
  const formattedViews = formatCount(totalViews);

  return (
    <div className={styles.artistCard}>
      <div className={styles.artistHeader}>
        <div className={styles.artistAvatar}>
          <Image src={thumb} alt={artist} width={72} height={72}
            className={styles.artistImg} loading="lazy" />
        </div>
        <div className={styles.artistMeta}>
          <h3 className={styles.artistName}>{artist}</h3>
          <p className={styles.artistCount}>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
          {formattedViews && (
            <p className={styles.artistViews}><FaEye style={{ fontSize: '0.55rem' }} /> {formattedViews} total views</p>
          )}
        </div>
      </div>
      <ul className={styles.artistSongs}>
        {songs.slice(0, 4).map((s, i) => (
          <li key={s.slug}>
            <Link href={`/viewlyrics/${s.slug}`} className={styles.artistSongRow}
              onClick={() => { trackClick(s.id); addRecent(s); }}>
              <span className={styles.artistSongNum}>{i + 1}</span>
              <span className={styles.artistSongTitle}>{s.title}</span>
              {formatCount(s.click_count) && (
                <span className={styles.artistSongViews}>{formatCount(s.click_count)}</span>
              )}
              <FaChevronRight className={styles.artistSongArrow} />
            </Link>
          </li>
        ))}
      </ul>
      {songs.length > 4 && (
        <p className={styles.artistMore}>+{songs.length - 4} more songs</p>
      )}
    </div>
  );
};

// ─── New release row ─────────────────────────────────────────
const NewRow = ({ song, index }) => {
  const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';

  const handleClick = () => {
    trackClick(song.id);
    addRecent(song);
  };

  return (
    <Link href={`/viewlyrics/${song.slug}`} className={styles.newRow}
      style={{ animationDelay: `${index * 0.07}s` }} onClick={handleClick}>
      <div className={styles.newThumbWrap}>
        <Image src={thumb} alt={song.title} width={60} height={60}
          className={styles.newThumb} loading="lazy" />
      </div>
      <div className={styles.newInfo}>
        <h4 className={styles.newTitle}>{song.title}</h4>
        <p className={styles.newArtist}>{song.artist}</p>
      </div>
      <span className={styles.newBadge}>NEW</span>
    </Link>
  );
};

// ─── Recently Viewed Strip ───────────────────────────────────
const RecentlyViewed = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionHead icon={<FaRegClock />} title="Recently Viewed" sub="Pick up where you left off" />
      <div className={styles.recentStrip}>
        {recent.map((song) => {
          const thumb = song.thumbnail_url?.trim() || '/logo/logo.webp';
          return (
            <Link key={song.slug} href={`/viewlyrics/${song.slug}`} className={styles.recentItem}>
              <div className={styles.recentThumb}>
                <Image src={thumb} alt={song.title} width={56} height={56}
                  className={styles.recentImg} loading="lazy" />
              </div>
              <p className={styles.recentTitle}>{song.title}</p>
              <p className={styles.recentArtist}>{song.artist}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ─── Share Button ─────────────────────────────────────────────
const ShareBtn = ({ song }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/viewlyrics/${song.slug}`;
    if (navigator.share) {
      try { await navigator.share({ title: song.title, text: `${song.title} - ${song.artist}`, url }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
      {copied ? <FaCheck /> : <FaShare />}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const LyricsLibrary = ({ allLyrics = [], trendingLyrics = [], newLyrics = [], featuredLyric = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const cardGrid   = useMemo(() => allLyrics.slice(10, 22), [allLyrics]);
  const quoteCards = useMemo(() =>
    allLyrics.filter(l => l.lyrics && l.lyrics.split('\n').filter(x => x.trim().length > 15).length >= 2).slice(0, 6),
  [allLyrics]);

  // Group songs by artist, pick top 4 artists with 2+ songs
  const artistSpotlights = useMemo(() => {
    const map = {};
    allLyrics.forEach(s => {
      if (!map[s.artist]) map[s.artist] = [];
      map[s.artist].push(s);
    });
    return Object.entries(map)
      .filter(([, songs]) => songs.length >= 2)
      .sort((a, b) => {
        const aViews = a[1].reduce((sum, s) => sum + (s.click_count || 0), 0);
        const bViews = b[1].reduce((sum, s) => sum + (s.click_count || 0), 0);
        return bViews - aViews;
      })
      .slice(0, 4)
      .map(([artist, songs]) => ({ artist, songs }));
  }, [allLyrics]);

  const filteredLyrics = useMemo(() =>
    allLyrics.filter(l =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [allLyrics, searchTerm]);

  const clearSearch = () => { setSearchTerm(''); inputRef.current?.focus(); };

  return (
    <div className={`${styles.page} ${mounted ? styles.mounted : ''}`}>
      <Head>
        <title>DynaBeat Library | Discover Lyrics</title>
        <meta name="description" content="Discover music lyrics, artist spotlights, and lyric quotes from every genre." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" />
      </Head>

      {/* ══════════════════════ HERO ══════════════════════════ */}
      <header className={styles.hero}>
        <Particles />
        <div className={styles.blob1} aria-hidden />
        <div className={styles.blob2} aria-hidden />

        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            <FaHeadphones /> DynaBeat · {allLyrics.length.toLocaleString()}+ Lyrics
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine1}>Every Song.</span>
            <span className={styles.heroLine2}>Every <em>Word.</em></span>
          </h1>

          <div className={`${styles.searchBar} ${focused ? styles.searchFocused : ''}`}>
            <FaSearch className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="search" inputMode="search"
              placeholder="Search songs, artists… (press /)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={styles.searchInput}
              autoComplete="off" spellCheck={false}
            />
            {searchTerm && (
              <button className={styles.clearBtn} onClick={clearSearch} aria-label="Clear">
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        <div className={styles.heroDivider} aria-hidden />
      </header>

      {/* ══════════════════════ MAIN ═════════════════════════ */}
      <main className={styles.main}>

        {/* ── SEARCH RESULTS ──────────────────────────────── */}
        {searchTerm ? (
          <section className={styles.section}>
            <SectionHead icon={<FaSearch />} title={`"${searchTerm}"`}
              sub={`${filteredLyrics.length} result${filteredLyrics.length !== 1 ? 's' : ''}`} />
            {filteredLyrics.length > 0 ? (
              <div className={styles.cardGrid}>
                {filteredLyrics.map((s, i) => <MusicCard key={s.slug} song={s} index={i} />)}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FaMusic /></div>
                <h3 className={styles.emptyTitle}>Not in our library yet</h3>
                <p className={styles.emptyText}>We couldn't find <strong>"{searchTerm}"</strong></p>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' lyrics')}`}
                  target="_blank" rel="noreferrer" className={styles.googleBtn}>
                  <FaGoogle /> Search on Google
                </a>
              </div>
            )}
          </section>
        ) : (
          <>

            {/* ─── RECENTLY VIEWED (client-only) ────────── */}
            {mounted && <RecentlyViewed />}

            {/* ─── 1. FEATURED SONG ─────────────────────── */}
            {featuredLyric && (
              <section className={styles.section}>
                <SectionHead icon={<FaStar />} title="Featured Today" sub="Editor's pick" />
                <FeaturedCard song={featuredLyric} />
              </section>
            )}

            {/* ─── AD SLOT 1 ────────────────────────────── */}
            <AdBanner slotId={AD_SLOTS.AFTER_HERO} label="Advertisement" />

            {/* ─── 2. TRENDING + NEW RELEASES (2-col) ───── */}
            <section className={styles.section}>
              <div className={styles.twoColLayout}>

                {/* Left: Trending by click count */}
                <div className={styles.trendingPanel}>
                  <SectionHead icon={<FaFire />} title="Trending" sub="Most viewed" />
                  <div className={styles.trendingList}>
                    {trendingLyrics.map((s, i) => (
                      <TrendingRow key={s.slug} song={s} rank={i + 1} />
                    ))}
                  </div>
                </div>

                {/* Right: New releases by published_date */}
                <div className={styles.newPanel}>
                  <SectionHead icon={<FaRegClock />} title="New This Week" sub="Just added" />
                  <div className={styles.newList}>
                    {newLyrics.map((s, i) => (
                      <NewRow key={s.slug} song={s} index={i} />
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* ─── AD SLOT 2 ────────────────────────────── */}
            <AdBanner slotId={AD_SLOTS.MID_PAGE} label="Sponsored" />

            {/* ─── 3. LYRIC QUOTE CARDS ─────────────────── */}
            {quoteCards.length > 0 && (
              <section className={styles.section}>
                <SectionHead icon={<FaQuoteLeft />} title="Lyric Moments"
                  sub="Lines that hit different" />
                <div className={styles.quotesGrid}>
                  {quoteCards.map((s, i) => (
                    <LyricQuoteCard key={s.slug} song={s} colorIndex={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── AD SLOT 3 ────────────────────────────── */}
            <AdBanner slotId={AD_SLOTS.BEFORE_ARTISTS} label="Advertisement" />

            {/* ─── 4. ARTIST SPOTLIGHTS ─────────────────── */}
            {artistSpotlights.length > 0 && (
              <section className={styles.section}>
                <SectionHead icon={<FaHeadphones />} title="Artist Spotlight"
                  sub="Top creators on DynaBeat" />
                <div className={styles.artistGrid}>
                  {artistSpotlights.map(({ artist, songs }) => (
                    <ArtistCard key={artist} artist={artist} songs={songs} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── 5. EXPLORE ALL — card grid ───────────── */}
            <section className={styles.section}>
              <SectionHead icon={<FaMusic />} title="Explore Library"
                sub={`${allLyrics.length} songs`} />
              <div className={styles.cardGrid}>
                {cardGrid.map((s, i) => <MusicCard key={s.slug} song={s} index={i} />)}
              </div>
            </section>

            {/* ─── AD SLOT 4 ────────────────────────────── */}
            <AdBanner slotId={AD_SLOTS.BOTTOM} label="Advertisement" />

          </>
        )}
      </main>
    </div>
  );
};

// ─── Data fetching ────────────────────────────────────────────
export const getStaticProps = async () => {
  try {
    // All lyrics (latest first) — used for New This Week, card grid, quotes, artists
    const { data: allData, error: allError } = await supabase
      .from('lyrics')
      .select('id, title, artist, slug, thumbnail_url, lyrics, status, published_date, click_count')
      .eq('status', 'approved')
      .order('published_date', { ascending: false });

    if (allError) throw allError;

    // Trending — sorted by click_count descending
    const { data: trendingData, error: trendingError } = await supabase
      .from('lyrics')
      .select('id, title, artist, slug, thumbnail_url, click_count')
      .eq('status', 'approved')
      .order('click_count', { ascending: false })
      .limit(10);

    if (trendingError) throw trendingError;

    const all = allData || [];
    const trending = trendingData || [];

    // New this week = newest 8 by published_date (already sorted above)
    const newLyrics = all.slice(0, 8);

    // Featured = random from top 5 most-clicked songs that have lyrics
    const withLyrics = [...all]
      .filter(l => l.lyrics && l.lyrics.length > 80)
      .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 5);
    const featuredLyric = withLyrics.length > 0
      ? withLyrics[Math.floor(Math.random() * withLyrics.length)]
      : null;

    return {
      props: {
        allLyrics: all,
        trendingLyrics: trending,
        newLyrics,
        featuredLyric: featuredLyric || null,
      },
      revalidate: 60,
    };
  } catch (err) {
    console.error(err);
    return {
      props: { allLyrics: [], trendingLyrics: [], newLyrics: [], featuredLyric: null },
      revalidate: 60,
    };
  }
};

export default LyricsLibrary;