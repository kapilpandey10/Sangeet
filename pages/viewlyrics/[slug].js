import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import { FaTwitter, FaFacebook, FaWhatsapp, FaArrowLeft, FaLanguage, FaHeart, FaCopy, FaCheck } from 'react-icons/fa';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';

// ─── Ad Component: Auto-refreshes every N seconds ────────────────────────────
const AdSlot = ({ slotId, format = 'auto', label = 'Advertisement', interval = null }) => {
  const [key, setKey] = useState(0);

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
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
  );
};

// ─── Sidebar sticky ad ────────────────────────────────────────────────────────
const SidebarAd = ({ slotId }) => (
  <div className={styles.sidebarAdUnit}>
    <span className={styles.adLabel}>Advertisement</span>
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '160px', height: '600px' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slotId}
      data-ad-format="vertical"
    />
    <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
  </div>
);

// ─── In-lyrics interstitial ad (appears between lyric sections) ───────────────
const InLyricsAd = ({ slotId }) => (
  <div className={styles.inLyricsAd}>
    <span className={styles.adLabel}>Advertisement</span>
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slotId}
      data-ad-format="fluid"
      data-ad-layout-key="-fb+5w+4e-db+86"
    />
    <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
  </div>
);

// ─── Split lyrics into chunks for in-content ads ─────────────────────────────
const splitLyrics = (text, chunkCount = 3) => {
  if (!text) return [''];
  const lines = text.split('\n');
  const size = Math.ceil(lines.length / chunkCount);
  return Array.from({ length: chunkCount }, (_, i) =>
    lines.slice(i * size, (i + 1) * size).join('\n')
  ).filter(Boolean);
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const youtubeRef = useRef(null);

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.active)),
      { threshold: 0.08 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lyric]);

  if (!lyric) return <div className={styles.errorWrapper}><p>{error || 'Lyric not found.'}</p></div>;

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </Head>

      {/* Immersive blurred background */}
      <div className={styles.bgBlur} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      <div className={styles.bgOverlay} />

      {/* ── AD SLOT 1: Top leaderboard (728×90) – highest visibility ── */}
      <div className={styles.topLeaderboard}>
        <AdSlot slotId="YOUR_TOP_LEADERBOARD_SLOT" format="auto" label="Advertisement" />
      </div>

      <div className={styles.outerLayout}>

        {/* ── LEFT SIDEBAR AD (sticky 160×600) ── */}
        <aside className={styles.leftSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId="YOUR_LEFT_SIDEBAR_SLOT" />
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className={styles.contentWrapper}>

          <nav className={styles.topNav}>
            <Link href="/viewlyrics" className={styles.backLink}>
              <FaArrowLeft /> All Lyrics
            </Link>
            <span className={styles.breadcrumb}>{lyric.artist} › {lyric.title}</span>
          </nav>

          {/* Hero */}
          <section className={`${styles.heroSection} ${styles.reveal}`}>
            <div className={styles.heroMain}>
              <div className={styles.imageWrapper}>
                <Image
                  src={thumbnailUrl}
                  alt={lyric.title}
                  width={260}
                  height={260}
                  className={styles.mainThumb}
                  priority
                />
                <div className={styles.imageGlow} />
              </div>
              <div className={styles.heroInfo}>
                <p className={styles.nowPlaying}>NOW PLAYING</p>
                <h1 className={styles.songTitle}>{lyric.title}</h1>
                <div className={styles.metaRow}>
                  <span className={styles.artistName}>{lyric.artist}</span>
                  {lyric.status === 'approved' && <Verified />}
                </div>
                <p className={styles.releaseYear}>
                  {lyric.published_date ? new Date(lyric.published_date).getFullYear() : '2026'}
                </p>
                <div className={styles.actionRow}>
                  <button onClick={() => setIsEnglish(!isEnglish)} className={styles.toggleBtn}>
                    <FaLanguage />
                    {isEnglish ? 'Original' : 'English'}
                  </button>
                  <button onClick={handleCopy} className={styles.iconBtn} title="Copy lyrics">
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                  <button onClick={() => setLiked(!liked)} className={`${styles.iconBtn} ${liked ? styles.liked : ''}`} title="Like">
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── AD SLOT 2: Below hero, above lyrics (high CTR zone) ── */}
          <div className={`${styles.reveal}`}>
            <AdSlot slotId="YOUR_BELOW_HERO_SLOT" interval={90000} label="Advertisement" />
          </div>

          {/* ── LYRICS SECTION: Split into chunks with ads between ── */}
          <section className={`${styles.lyricsSection} ${styles.reveal}`}>
            <div className={styles.glassPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  {isEnglish ? '🌐 English Translation' : '🎵 Original Lyrics'}
                </span>
                <span className={styles.panelMeta}>{lyric.artist}</span>
              </div>

              {/* Chunk 1 */}
              <pre className={styles.lyricsBody}>{lyricChunks[0]}</pre>
            </div>
          </section>

          {/* ── AD SLOT 3: Mid-lyrics ad (in-feed/fluid format) ── */}
          {lyricChunks.length > 1 && (
            <>
              <InLyricsAd slotId="YOUR_MID_LYRICS_SLOT_1" />
              <section className={`${styles.lyricsSection} ${styles.reveal}`}>
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[1]}</pre>
                </div>
              </section>
            </>
          )}

          {/* ── AD SLOT 4: Second mid-lyrics ad ── */}
          {lyricChunks.length > 2 && (
            <>
              <InLyricsAd slotId="YOUR_MID_LYRICS_SLOT_2" />
              <section className={`${styles.lyricsSection} ${styles.reveal}`}>
                <div className={styles.glassPanel}>
                  <pre className={styles.lyricsBody}>{lyricChunks[2]}</pre>
                </div>
              </section>
            </>
          )}

          {/* ── AD SLOT 5: Below full lyrics (auto-refresh 60s) ── */}
          <AdSlot slotId="YOUR_BELOW_LYRICS_SLOT" interval={60000} label="Advertisement" />

          {/* Share Bar */}
          <div className={`${styles.shareBar} ${styles.reveal}`}>
            <p className={styles.shareLabel}>Share this song</p>
            <div className={styles.shareButtons}>
              <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className={`${styles.shareBtn} ${styles.fb}`}><FaFacebook /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(`${lyric.title} by ${lyric.artist}`)}`} target="_blank" rel="noreferrer" className={`${styles.shareBtn} ${styles.tw}`}><FaTwitter /></a>
              <a href={`whatsapp://send?text=${encodeURIComponent(`${lyric.title} lyrics: ${pageUrl}`)}`} target="_blank" rel="noreferrer" className={`${styles.shareBtn} ${styles.wa}`}><FaWhatsapp /></a>
            </div>
          </div>

          {/* ── AD SLOT 6: Before video (premium placement) ── */}
          {youtubeId && (
            <>
              <AdSlot slotId="YOUR_BEFORE_VIDEO_SLOT" label="Advertisement" />
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
              {/* ── AD SLOT 7: After video ── */}
              <AdSlot slotId="YOUR_AFTER_VIDEO_SLOT" interval={75000} label="Advertisement" />
            </>
          )}

          {/* Related Tracks */}
          {relatedLyrics.length > 0 && (
            <>
              {/* ── AD SLOT 8: Before related (native-style) ── */}
              <AdSlot slotId="YOUR_BEFORE_RELATED_SLOT" format="fluid" label="Sponsored" />

              <section className={`${styles.relatedSection} ${styles.reveal}`}>
                <h3 className={styles.sectionLabel}>Similar Tracks</h3>
                <div className={styles.relatedGrid}>
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

                  {/* ── AD SLOT 9: Inline native ad within related grid ── */}
                  <div className={styles.nativeAdCard}>
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block' }}
                      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
                      data-ad-slot="YOUR_NATIVE_RELATED_SLOT"
                      data-ad-format="fluid"
                      data-ad-layout="in-article"
                    />
                    <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
                  </div>

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

          {/* ── AD SLOT 10: Bottom sticky / footer banner ── */}
          <AdSlot slotId="YOUR_BOTTOM_BANNER_SLOT" interval={120000} label="Advertisement" />

        </main>

        {/* ── RIGHT SIDEBAR AD (sticky 160×600) ── */}
        <aside className={styles.rightSidebar}>
          <div className={styles.stickyAd}>
            <SidebarAd slotId="YOUR_RIGHT_SIDEBAR_SLOT" />
            {/* ── AD SLOT 12: Second sidebar ad below first ── */}
            <div style={{ marginTop: '20px' }}>
              <SidebarAd slotId="YOUR_RIGHT_SIDEBAR_SLOT_2" />
            </div>
          </div>
        </aside>

      </div>

      {/* ── AD SLOT 13: Fixed bottom sticky ad (mobile-focused) ── */}
      <div className={styles.stickyBottomAd}>
        <button className={styles.closeSticky} onClick={e => e.currentTarget.parentElement.style.display = 'none'}>✕</button>
        <AdSlot slotId="YOUR_STICKY_BOTTOM_SLOT" format="auto" label="Advertisement" />
      </div>

      <FloatingModal />
    </div>
  );
};

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
