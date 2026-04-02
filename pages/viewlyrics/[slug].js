import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import NextImage from 'next/image';
import { supabase } from '../../supabaseClient';
import {
  FaTwitter, FaFacebook, FaWhatsapp,
  FaArrowLeft, FaLanguage, FaHeart,
  FaCopy, FaCheck, FaShieldAlt
} from 'react-icons/fa';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';

// ─── AdSense config ───────────────────────────────────────────
const ADSENSE_CLIENT = 'ca-pub-9887409333966239';

const AD_SLOTS = {
  TOP_LEADERBOARD:  '3280594056',
  BELOW_HERO:       '9654430713',
  MID_LYRICS_1:     '1815265882',
  MID_LYRICS_2:     '3280594056',
  BELOW_LYRICS:     '7959039819',
  BEFORE_VIDEO:     '4413509067',
  AFTER_VIDEO:      '1815265882',
  BEFORE_RELATED:   '9654430713',
  NATIVE_RELATED:   '2730763868',
  BOTTOM_BANNER:    '3280594056',
  LEFT_SIDEBAR:     '3886159363',
  RIGHT_SIDEBAR_1:  '9138486045',
  RIGHT_SIDEBAR_2:  '2730763868',
  STICKY_FOOTER:    '3886159363',
};

const pushAd = () => {
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
};

// ═══════════════════════════════════════════════════════════════
// AD BLOCKER MODAL
// ═══════════════════════════════════════════════════════════════
const AdBlockerModal = ({ onDismiss }) => (
  <div className={styles.adBlockOverlay}>
    <div className={styles.adBlockModal}>
      <div className={styles.adBlockIcon}><FaShieldAlt /></div>
      <h2 className={styles.adBlockTitle}>Ad Blocker Detected</h2>
      <p className={styles.adBlockText}>
        DynaBeat is completely free — ads are the <strong>only way</strong> we keep
        the lights on and continue adding new lyrics for you.
      </p>
      <p className={styles.adBlockSubText}>
        Please whitelist <strong>dynabeat.com</strong> in your ad blocker and refresh.
        It only takes 10 seconds! 🙏
      </p>
      <div className={styles.adBlockButtons}>
        <a
          href="https://support.google.com/adsense/answer/10762946"
          target="_blank"
          rel="noreferrer"
          className={styles.adBlockPrimary}
        >
          How to whitelist →
        </a>
        <button onClick={onDismiss} className={styles.adBlockSecondary}>
          I&apos;ll do it later
        </button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// STANDARD AD SLOT
// ═══════════════════════════════════════════════════════════════
const AdSlot = ({ slotId, format = 'auto', label = 'Advertisement', interval = null, onBlocked }) => {
  const [key, setKey]         = useState(0);
  const [visible, setVisible] = useState(true);
  const insRef                = useRef(null);

  useEffect(() => {
    pushAd();
    const timer = setTimeout(() => {
      if (!insRef.current) return;
      const status = insRef.current.getAttribute('data-ad-status');
      if (status === 'unfilled') {
        setVisible(false);
      } else if (!status) {
        onBlocked?.();
        setVisible(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!interval) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setVisible(true);
        setKey(k => k + 1);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  if (!visible) return null;

  return (
    <div className={styles.adUnit} key={key}>
      <span className={styles.adLabel}>{label}</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SIDEBAR AD
// ═══════════════════════════════════════════════════════════════
const SidebarAd = ({ slotId, onBlocked }) => {
  const [visible, setVisible] = useState(true);
  const insRef = useRef(null);

  useEffect(() => {
    pushAd();
    const timer = setTimeout(() => {
      if (!insRef.current) return;
      const status = insRef.current.getAttribute('data-ad-status');
      if (!status || status === 'unfilled') {
        setVisible(false);
        if (!status) onBlocked?.();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div className={styles.sidebarAdUnit}>
      <span className={styles.adLabel}>Advertisement</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// IN-CONTENT AD
// ═══════════════════════════════════════════════════════════════
const InContentAd = ({ slotId, onBlocked }) => {
  const [visible, setVisible] = useState(true);
  const insRef = useRef(null);

  useEffect(() => {
    pushAd();
    const timer = setTimeout(() => {
      if (!insRef.current) return;
      const status = insRef.current.getAttribute('data-ad-status');
      if (!status || status === 'unfilled') {
        setVisible(false);
        if (!status) onBlocked?.();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div className={styles.inContentAd}>
      <span className={styles.adLabel}>Advertisement</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NATIVE AD CARD
// ═══════════════════════════════════════════════════════════════
const NativeRelatedAd = ({ slotId, onBlocked }) => {
  const [visible, setVisible] = useState(true);
  const insRef = useRef(null);

  useEffect(() => {
    pushAd();
    const timer = setTimeout(() => {
      if (!insRef.current) return;
      const status = insRef.current.getAttribute('data-ad-status');
      if (!status || status === 'unfilled') {
        setVisible(false);
        if (!status) onBlocked?.();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div className={styles.nativeAdCard}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// ─── Split lyrics into N chunks ───────────────────────────────
const splitLyrics = (text, chunkCount = 3) => {
  if (!text) return [''];
  const lines = text.split('\n');
  const size  = Math.ceil(lines.length / chunkCount);
  return Array.from({ length: chunkCount }, (_, i) =>
    lines.slice(i * size, (i + 1) * size).join('\n')
  ).filter(c => c.trim());
};

// ─── Shared copy/context-menu block handler ───────────────────
const blockEvent = (e) => e.preventDefault();

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish]               = useState(false);
  const [copied, setCopied]                     = useState(false);
  const [liked, setLiked]                       = useState(false);
  const [stickyVisible, setStickyVisible]       = useState(true);
  const [adBlockDetected, setAdBlockDetected]   = useState(false);
  const [adBlockDismissed, setAdBlockDismissed] = useState(false);
  const youtubeRef      = useRef(null);
  const adBlockReported = useRef(false);

  // ── Ad-block detection ──────────────────────────────────────
  const handleAdBlocked = useCallback(() => {
    if (!adBlockReported.current) {
      adBlockReported.current = true;
      setTimeout(() => setAdBlockDetected(true), 800);
    }
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {};
    img.onerror = () => handleAdBlocked();
    img.src = `https://pagead2.googlesyndication.com/pagead/show_ads.js?t=${Date.now()}`;
  }, [handleAdBlocked]);

  // ── Copy / Selection protection ─────────────────────────────
  useEffect(() => {
    document.addEventListener('copy',        blockEvent);
    document.addEventListener('cut',         blockEvent);
    document.addEventListener('selectstart', blockEvent);
    document.addEventListener('contextmenu', blockEvent);

    return () => {
      document.removeEventListener('copy',        blockEvent);
      document.removeEventListener('cut',         blockEvent);
      document.removeEventListener('selectstart', blockEvent);
      document.removeEventListener('contextmenu', blockEvent);
    };
  }, []);

  // ── Scroll reveal ───────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.active)),
      { threshold: 0.08 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lyric]);

  if (!lyric) return (
    <div className={styles.errorWrapper}>
      <p>{error || 'Lyric not found.'}</p>
    </div>
  );

  const youtubeId    = lyric.music_url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const thumbnailUrl = lyric.thumbnail_url?.trim() || '/logo/logo.webp';
  const currentText  = isEnglish ? (lyric.english_lyrics || '') : lyric.lyrics;
  const lyricChunks  = splitLyrics(currentText, 3);
  const pageUrl      = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const noSelectProps = {
    onCopy:        blockEvent,
    onCut:         blockEvent,
    onContextMenu: blockEvent,
  };

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>{`${lyric.title} Lyrics | DynaBeat`}</title>
        <meta name="description" content={`Read the original and English lyrics for ${lyric.title} by ${lyric.artist}.`} />
        <meta property="og:title" content={`${lyric.title} Lyrics`} />
        <meta property="og:description" content={`${lyric.artist} — Read lyrics on DynaBeat`} />
        <meta property="og:image" content={thumbnailUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </Head>

      {adBlockDetected && !adBlockDismissed && (
        <AdBlockerModal onDismiss={() => setAdBlockDismissed(true)} />
      )}

      <div className={styles.bgBlur} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      <div className={styles.bgOverlay} />

      <div className={styles.topLeaderboard}>
        <AdSlot slotId={AD_SLOTS.TOP_LEADERBOARD} onBlocked={handleAdBlocked} />
      </div>

      <div className={styles.outerLayout}>

        <aside className={styles.leftSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId={AD_SLOTS.LEFT_SIDEBAR} onBlocked={handleAdBlocked} />
          </div>
        </aside>

        <main className={styles.contentWrapper}>

          <nav className={styles.topNav}>
            <Link href="/viewlyrics" className={styles.backLink}>
              <FaArrowLeft /> All Lyrics
            </Link>
            <span className={styles.breadcrumb}>{lyric.artist} › {lyric.title}</span>
          </nav>

          <section className={`${styles.heroSection} ${styles.reveal}`}>
            <div className={styles.heroMain}>
              <div className={styles.imageWrapper}>
                <NextImage
                  src={thumbnailUrl}
                  alt={lyric.title}
                  width={240}
                  height={240}
                  className={styles.mainThumb}
                  priority
                />
              </div>
              <div className={styles.heroInfo}>
                <p className={styles.nowPlaying}>NOW PLAYING</p>
                <h1 className={styles.songTitle}>{lyric.title}</h1>
                <div className={styles.metaRow}>
                  <span className={styles.artistName}>{lyric.artist}</span>
                  {lyric.status === 'approved' && <Verified />}
                </div>
                <p className={styles.releaseYear}>
                  {lyric.published_date
                    ? `Released ${new Date(lyric.published_date).getFullYear()}`
                    : 'DynaBeat'}
                </p>
                {/* Show view count on the song page itself */}
                {lyric.click_count > 0 && (
                  <p className={styles.viewCount}>
                    👁 {lyric.click_count.toLocaleString()} views
                  </p>
                )}
                <div className={styles.actionRow}>
                  <button onClick={() => setIsEnglish(!isEnglish)} className={styles.toggleBtn}>
                    <FaLanguage /> {isEnglish ? 'Original' : 'English'}
                  </button>
                  <button onClick={handleCopy} className={styles.iconBtn} title="Copy lyrics">
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`${styles.iconBtn} ${liked ? styles.liked : ''}`}
                    title="Like"
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <AdSlot
            slotId={AD_SLOTS.BELOW_HERO}
            interval={90000}
            onBlocked={handleAdBlocked}
          />

          <section
            className={`${styles.lyricsSection} ${styles.reveal}`}
            {...noSelectProps}
          >
            <div className={styles.glassPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  {isEnglish ? '🌐 English Translation' : '🎵 Original Lyrics'}
                </span>
                <span className={styles.panelMeta}>{lyric.artist}</span>
              </div>
              <pre className={styles.lyricsBody}>{lyricChunks[0]}</pre>
            </div>
          </section>

          {lyricChunks.length > 1 && (
            <>
              <InContentAd slotId={AD_SLOTS.MID_LYRICS_1} onBlocked={handleAdBlocked} />
              <section
                className={`${styles.lyricsSection} ${styles.reveal}`}
                {...noSelectProps}
              >
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[1]}</pre>
                </div>
              </section>
            </>
          )}

          {lyricChunks.length > 2 && (
            <>
              <InContentAd slotId={AD_SLOTS.MID_LYRICS_2} onBlocked={handleAdBlocked} />
              <section
                className={`${styles.lyricsSection} ${styles.reveal}`}
                {...noSelectProps}
              >
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[2]}</pre>
                </div>
              </section>
            </>
          )}

          <AdSlot
            slotId={AD_SLOTS.BELOW_LYRICS}
            interval={60000}
            onBlocked={handleAdBlocked}
          />

          <div className={`${styles.shareBar} ${styles.reveal}`}>
            <p className={styles.shareLabel}>Share this song</p>
            <div className={styles.shareButtons}>
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noreferrer"
                className={`${styles.shareBtn} ${styles.fb}`}
              ><FaFacebook /></a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(`${lyric.title} by ${lyric.artist}`)}`}
                target="_blank" rel="noreferrer"
                className={`${styles.shareBtn} ${styles.tw}`}
              ><FaTwitter /></a>
              <a
                href={`whatsapp://send?text=${encodeURIComponent(`${lyric.title} lyrics: ${pageUrl}`)}`}
                target="_blank" rel="noreferrer"
                className={`${styles.shareBtn} ${styles.wa}`}
              ><FaWhatsapp /></a>
            </div>
          </div>

          {youtubeId && (
            <>
              <AdSlot slotId={AD_SLOTS.BEFORE_VIDEO} onBlocked={handleAdBlocked} />
              <section className={`${styles.videoSection} ${styles.reveal}`}>
                <h3 className={styles.sectionLabel}>Official Music Video</h3>
                <div className={styles.videoWrapper} ref={youtubeRef}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Music Video"
                    allowFullScreen
                  />
                </div>
              </section>
              <AdSlot
                slotId={AD_SLOTS.AFTER_VIDEO}
                interval={75000}
                onBlocked={handleAdBlocked}
              />
            </>
          )}

          {relatedLyrics.length > 0 && (
            <>
              <AdSlot
                slotId={AD_SLOTS.BEFORE_RELATED}
                label="Sponsored"
                onBlocked={handleAdBlocked}
              />
              <section className={`${styles.relatedSection} ${styles.reveal}`}>
                <h3 className={styles.sectionLabel}>Similar Tracks</h3>
                <div className={styles.relatedGrid}>
                  {relatedLyrics.slice(0, 2).map(song => (
                    <Link href={`/viewlyrics/${song.slug}`} key={song.id} className={styles.smallCard}>
                      <div className={styles.smallThumb}>
                        <NextImage src={song.thumbnail_url || '/logo/logo.webp'} alt={song.title} fill />
                      </div>
                      <div className={styles.smallInfo}>
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                    </Link>
                  ))}
                  <NativeRelatedAd slotId={AD_SLOTS.NATIVE_RELATED} onBlocked={handleAdBlocked} />
                  {relatedLyrics.slice(2).map(song => (
                    <Link href={`/viewlyrics/${song.slug}`} key={song.id} className={styles.smallCard}>
                      <div className={styles.smallThumb}>
                        <NextImage src={song.thumbnail_url || '/logo/logo.webp'} alt={song.title} fill />
                      </div>
                      <div className={styles.smallInfo}>
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          <AdSlot
            slotId={AD_SLOTS.BOTTOM_BANNER}
            interval={120000}
            onBlocked={handleAdBlocked}
          />

        </main>

        <aside className={styles.rightSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId={AD_SLOTS.RIGHT_SIDEBAR_1} onBlocked={handleAdBlocked} />
            <div className={styles.sidebarGap}>
              <SidebarAd slotId={AD_SLOTS.RIGHT_SIDEBAR_2} onBlocked={handleAdBlocked} />
            </div>
          </div>
        </aside>

      </div>

      {stickyVisible && (
        <div className={styles.stickyBottomAd}>
          <button
            className={styles.closeSticky}
            onClick={() => setStickyVisible(false)}
            aria-label="Close ad"
          >✕</button>
          <AdSlot slotId={AD_SLOTS.STICKY_FOOTER} onBlocked={handleAdBlocked} />
        </div>
      )}

      <FloatingModal />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DATA FETCHING
// ═══════════════════════════════════════════════════════════════
export const getServerSideProps = async (context) => {
  const { slug } = context.params;
  try {
    const { data: lyric, error } = await supabase
      .from('lyrics')
      .select('*')
      .ilike('slug', slug.toLowerCase())
      .limit(1)
      .single();

    if (error || !lyric) {
      return { props: { lyric: null, relatedLyrics: [], slug, error: 'Lyric not found.' } };
    }

    // ── Increment click count on every real page visit ──────
    // Runs server-side so it catches direct URL visits, not just card clicks
    await supabase.rpc('increment_click_count', { song_id: lyric.id });

    // Return the updated count so the page shows the live number
    lyric.click_count = (lyric.click_count || 0) + 1;

    const { data: relatedLyrics } = await supabase
      .from('lyrics')
      .select('id, title, artist, thumbnail_url, slug')
      .neq('slug', slug.toLowerCase())
      .eq('status', 'approved')
      .limit(6);

    return {
      props: { lyric, relatedLyrics: relatedLyrics || [], slug, error: null },
    };
  } catch {
    return { props: { lyric: null, relatedLyrics: [], slug, error: 'Server error.' } };
  }
};

export default ViewLyrics;