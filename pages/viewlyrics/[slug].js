import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import { FaTwitter, FaFacebook, FaWhatsapp, FaArrowLeft, FaLanguage, FaHeart, FaCopy, FaCheck } from 'react-icons/fa';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';

// ─── Your AdSense Publisher ID ────────────────────────────────
const ADSENSE_CLIENT = 'ca-pub-9887409333966239';

// ─── Ad Slot IDs — replace these with your real slot IDs from AdSense dashboard ──
// Go to AdSense → Ads → By ad unit → Create new ad unit → copy the data-ad-slot value
const AD_SLOTS = {
  TOP_LEADERBOARD:   '3280594056',   // Slot 1: top of page
  BELOW_HERO:        '9654430713',   // Slot 2: below hero card
  MID_LYRICS_1:      '1815265882',   // Slot 3: between lyric chunk 1 & 2
  MID_LYRICS_2:      '3280594056',   // Slot 4: between lyric chunk 2 & 3
  BELOW_LYRICS:      '4413509067',   // Slot 5: below full lyrics
  BEFORE_VIDEO:      '4413509067',   // Slot 6: before YouTube embed
  AFTER_VIDEO:       '1815265882',   // Slot 7: after YouTube embed
  BEFORE_RELATED:    '9654430713',   // Slot 8: before related tracks
  NATIVE_RELATED:    '9654430713',   // Slot 9: native ad inside related grid
  BOTTOM_BANNER:     '3280594056',   // Slot 10: page bottom
  LEFT_SIDEBAR:      '3886159363',   // Slot 11: left sticky skyscraper
  RIGHT_SIDEBAR_1:   '9138486045',   // Slot 12: right sticky skyscraper
  RIGHT_SIDEBAR_2:   '9138486045',   // Slot 13: second right sidebar ad
  STICKY_FOOTER:     '3886159363',   // Slot 14: fixed mobile footer
};

// ─── Push ad to adsbygoogle queue ────────────────────────────
const pushAd = () => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('AdSense push error:', e);
  }
};

// ─── Standard inline ad unit (auto-refreshing) ───────────────
const AdSlot = ({ slotId, format = 'auto', layoutKey = null, label = 'Advertisement', interval = null }) => {
  const [key, setKey] = useState(0);
  const insRef = useRef(null);

  useEffect(() => {
    pushAd();
  }, [key]);

  useEffect(() => {
    if (!interval) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setKey(prev => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

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
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};

// ─── Sidebar skyscraper (160×600) ────────────────────────────
const SidebarAd = ({ slotId }) => {
  useEffect(() => { pushAd(); }, []);
  return (
    <div className={styles.sidebarAdUnit}>
      <span className={styles.adLabel}>Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
      />
    </div>
  );
};

// ─── In-lyrics fluid ad (blends between lyric chunks) ────────
const InLyricsAd = ({ slotId }) => {
  useEffect(() => { pushAd(); }, []);
  return (
    <div className={styles.inLyricsAd}>
      <span className={styles.adLabel}>Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    </div>
  );
};

// ─── Split lyrics text into N chunks for in-content ads ──────
const splitLyrics = (text, chunkCount = 3) => {
  if (!text) return [''];
  const lines = text.split('\n');
  const size = Math.ceil(lines.length / chunkCount);
  return Array.from({ length: chunkCount }, (_, i) =>
    lines.slice(i * size, (i + 1) * size).join('\n')
  ).filter(c => c.trim());
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(true);
  const youtubeRef = useRef(null);

  // Scroll reveal animation
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

  const youtubeId = lyric.music_url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const thumbnailUrl = lyric.thumbnail_url?.trim() || '/logo/logo.webp';
  const currentText = isEnglish ? (lyric.english_lyrics || '') : lyric.lyrics;
  const lyricChunks = splitLyrics(currentText, 3);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
        {/* AdSense script — your publisher ID */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </Head>

      {/* Immersive blurred album art background */}
      <div className={styles.bgBlur} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      <div className={styles.bgOverlay} />

      {/* ══ SLOT 1: Top Leaderboard (728×90) — loads above fold, first impression ══ */}
      <div className={styles.topLeaderboard}>
        <AdSlot slotId={AD_SLOTS.TOP_LEADERBOARD} label="Advertisement" />
      </div>

      {/* Three-column layout: sidebar | content | sidebar */}
      <div className={styles.outerLayout}>

        {/* ══ SLOT 11: Left Sticky Skyscraper (desktop only) ══ */}
        <aside className={styles.leftSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId={AD_SLOTS.LEFT_SIDEBAR} />
          </div>
        </aside>

        {/* ── Main Content Column ─────────────────────────────── */}
        <main className={styles.contentWrapper}>

          {/* Nav */}
          <nav className={styles.topNav}>
            <Link href="/viewlyrics" className={styles.backLink}>
              <FaArrowLeft /> All Lyrics
            </Link>
            <span className={styles.breadcrumb}>{lyric.artist} › {lyric.title}</span>
          </nav>

          {/* ── Hero Card ───────────────────────────────────────── */}
          <section className={`${styles.heroSection} ${styles.reveal}`}>
            <div className={styles.heroMain}>
              <div className={styles.imageWrapper}>
                <Image
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
                <div className={styles.actionRow}>
                  <button onClick={() => setIsEnglish(!isEnglish)} className={styles.toggleBtn}>
                    <FaLanguage />
                    {isEnglish ? 'Original' : 'English'}
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

          {/* ══ SLOT 2: Below Hero — high-attention zone before lyrics start ══ */}
          <AdSlot
            slotId={AD_SLOTS.BELOW_HERO}
            interval={90000}
            label="Advertisement"
          />

          {/* ── Lyrics: Chunk 1 ─────────────────────────────────── */}
          <section className={`${styles.lyricsSection} ${styles.reveal}`}>
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

          {/* ══ SLOT 3: Mid-lyrics 1 (fluid, in-feed) — user is scrolling through lyrics ══ */}
          {lyricChunks.length > 1 && (
            <>
              <InLyricsAd slotId={AD_SLOTS.MID_LYRICS_1} />
              <section className={`${styles.lyricsSection} ${styles.reveal}`}>
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[1]}</pre>
                </div>
              </section>
            </>
          )}

          {/* ══ SLOT 4: Mid-lyrics 2 — deep in lyrics, high dwell-time user ══ */}
          {lyricChunks.length > 2 && (
            <>
              <InLyricsAd slotId={AD_SLOTS.MID_LYRICS_2} />
              <section className={`${styles.lyricsSection} ${styles.reveal}`}>
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[2]}</pre>
                </div>
              </section>
            </>
          )}

          {/* ══ SLOT 5: Below full lyrics — auto-refreshes every 60s ══ */}
          <AdSlot
            slotId={AD_SLOTS.BELOW_LYRICS}
            interval={60000}
            label="Advertisement"
          />

          {/* ── Share Bar ───────────────────────────────────────── */}
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

          {/* ── YouTube Video ───────────────────────────────────── */}
          {youtubeId && (
            <>
              {/* ══ SLOT 6: Before video — premium attention spot ══ */}
              <AdSlot slotId={AD_SLOTS.BEFORE_VIDEO} label="Advertisement" />

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

              {/* ══ SLOT 7: After video — post-watch engagement peak, refreshes every 75s ══ */}
              <AdSlot
                slotId={AD_SLOTS.AFTER_VIDEO}
                interval={75000}
                label="Advertisement"
              />
            </>
          )}

          {/* ── Related Tracks ──────────────────────────────────── */}
          {relatedLyrics.length > 0 && (
            <>
              {/* ══ SLOT 8: Before related — native/fluid format ══ */}
              <AdSlot
                slotId={AD_SLOTS.BEFORE_RELATED}
                format="fluid"
                label="Sponsored"
              />

              <section className={`${styles.relatedSection} ${styles.reveal}`}>
                <h3 className={styles.sectionLabel}>Similar Tracks</h3>
                <div className={styles.relatedGrid}>

                  {/* First 2 real tracks */}
                  {relatedLyrics.slice(0, 2).map(song => (
                    <Link href={`/viewlyrics/${song.slug}`} key={song.id} className={styles.smallCard}>
                      <div className={styles.smallThumb}>
                        <Image src={song.thumbnail_url || '/logo/logo.webp'} alt={song.title} fill />
                      </div>
                      <div className={styles.smallInfo}>
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                    </Link>
                  ))}

                  {/* ══ SLOT 9: Native ad card inside related grid — disguised as a track card ══ */}
                  <div className={styles.nativeAdCard}>
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block' }}
                      data-ad-client={ADSENSE_CLIENT}
                      data-ad-slot={AD_SLOTS.NATIVE_RELATED}
                      data-ad-format="fluid"
                      data-ad-layout="in-article"
                    />
                  </div>

                  {/* Remaining tracks */}
                  {relatedLyrics.slice(2).map(song => (
                    <Link href={`/viewlyrics/${song.slug}`} key={song.id} className={styles.smallCard}>
                      <div className={styles.smallThumb}>
                        <Image src={song.thumbnail_url || '/logo/logo.webp'} alt={song.title} fill />
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

          {/* ══ SLOT 10: Bottom banner — catches users at end of page, refreshes 120s ══ */}
          <AdSlot
            slotId={AD_SLOTS.BOTTOM_BANNER}
            interval={120000}
            label="Advertisement"
          />

        </main>

        {/* ══ SLOTS 12 & 13: Right Sticky Skyscrapers (tablet + desktop) ══ */}
        <aside className={styles.rightSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId={AD_SLOTS.RIGHT_SIDEBAR_1} />
            <div className={styles.sidebarGap}>
              <SidebarAd slotId={AD_SLOTS.RIGHT_SIDEBAR_2} />
            </div>
          </div>
        </aside>

      </div>

      {/* ══ SLOT 14: Fixed sticky footer — always visible on mobile, dismissible ══ */}
      {stickyVisible && (
        <div className={styles.stickyBottomAd}>
          <button
            className={styles.closeSticky}
            onClick={() => setStickyVisible(false)}
            aria-label="Close ad"
          >✕</button>
          <AdSlot
            slotId={AD_SLOTS.STICKY_FOOTER}
            format="auto"
            label="Advertisement"
          />
        </div>
      )}

      <FloatingModal />
    </div>
  );
};

// ─── Data Fetching ────────────────────────────────────────────
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

    const { data: relatedLyrics } = await supabase
      .from('lyrics')
      .select('id, title, artist, thumbnail_url, slug')
      .neq('slug', slug.toLowerCase())
      .eq('status', 'approved')
      .limit(6);

    return { props: { lyric, relatedLyrics: relatedLyrics || [], slug, error: null } };
  } catch {
    return { props: { lyric: null, relatedLyrics: [], slug, error: 'Server error.' } };
  }
};

export default ViewLyrics;
