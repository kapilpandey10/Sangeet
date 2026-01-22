import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import { FaTwitter, FaFacebook, FaWhatsapp, FaArrowLeft, FaLanguage } from 'react-icons/fa';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';

  {/* Correctly uses your Publisher ID from environment variables */}
  <script 
    async 
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} 
    crossOrigin="anonymous"
  ></script>

// 1. Refreshing Ad Component: Triggers a new impression every 60 seconds.js]
const RefreshingAdSlot = ({ id, interval = 60000 }) => {
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Only refresh if the tab is visible to the user
      if (document.visibilityState === 'visible') {
        setAdKey(prev => prev + 1);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={styles.adWrapper} key={adKey}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
           data-ad-slot={id}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script dangerouslySetInnerHTML={{ 
        __html: '(adsbygoogle = window.adsbygoogle || []).push({});' 
      }} />
    </div>
  );
};

const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish] = useState(false);
  const youtubeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add(styles.active);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(`.${styles.reveal}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lyric]);

  if (!lyric) return <div className={styles.errorWrapper}><p>{error}</p></div>;

  const youtubeId = lyric.music_url ? lyric.music_url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] : null;
  const thumbnailUrl = lyric.thumbnail_url?.trim() || '/logo/logo.webp';

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>{`${lyric.title} Lyrics | DynaBeat`}</title>
        <meta name="description" content={`Read the original and English lyrics for ${lyric.title} by ${lyric.artist}.`} />
        {/* Global AdSense Script */}
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} crossOrigin="anonymous"></script>
      </Head>

      <div className={styles.bgBlur} style={{ backgroundImage: `url(${thumbnailUrl})` }}></div>
      <div className={styles.bgOverlay}></div>

      <main className={styles.contentWrapper}>
        <nav className={styles.topNav}>
          <Link href="/viewlyrics" className={styles.backLink}>
            <FaArrowLeft /> All Lyrics
          </Link>
        </nav>

        <section className={`${styles.heroSection} ${styles.reveal}`}>
          <div className={styles.heroMain}>
            <div className={styles.imageWrapper}>
              <Image 
                src={thumbnailUrl} 
                alt={lyric.title} 
                width={300} 
                height={300} 
                className={styles.mainThumb}
                priority
              />
            </div>
            <div className={styles.heroInfo}>
              <h1 className={styles.songTitle}>{lyric.title}</h1>
              <div className={styles.metaRow}>
                <span className={styles.artistName}>{lyric.artist}</span>
                {lyric.status === 'approved' && <Verified />}
              </div>
              <p className={styles.releaseYear}>Released in {lyric.published_date ? new Date(lyric.published_date).getFullYear() : '2026'}</p>
              
              <div className={styles.actionRow}>
                <button onClick={() => setIsEnglish(!isEnglish)} className={styles.toggleBtn}>
                  <FaLanguage /> {isEnglish ? 'Show Original' : 'Translate to English'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STATIC AD: Initial impression */}
        <RefreshingAdSlot id="TOP_AD_SLOT_ID" interval={90000} />

        <section className={`${styles.lyricsSection} ${styles.reveal}`}>
          <div className={styles.glassPanel}>
            <div className={styles.panelHeader}>
               <span>{isEnglish ? 'English Version' : 'Original Lyrics'}</span>
            </div>
            <pre className={styles.lyricsBody}>
              {isEnglish ? (lyric.english_lyrics || "English translation coming soon...") : lyric.lyrics}
            </pre>
          </div>
        </section>

        {/* REFRESHING AD: High frequency refresh (60s) for middle content.js] */}
        <RefreshingAdSlot id="MIDDLE_AD_SLOT_ID" interval={60000} />

        {youtubeId && (
          <section className={`${styles.videoSection} ${styles.reveal}`}>
            <h3 className={styles.sectionLabel}>Official Music Video</h3>
            <div className={styles.videoWrapper} ref={youtubeRef}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Music Video"
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        <div className={styles.shareBar}>
           <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer"><FaFacebook /></a>
           <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer"><FaTwitter /></a>
           <a href={`whatsapp://send?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer"><FaWhatsapp /></a>
        </div>

        <section className={`${styles.relatedSection} ${styles.reveal}`}>
          <h3 className={styles.sectionLabel}>Similar Tracks</h3>
          <div className={styles.relatedGrid}>
            {relatedLyrics.map((song) => (
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

        <FloatingModal />
      </main>
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
      .limit(5);

    return { props: { lyric, relatedLyrics: relatedLyrics || [], slug, error: null } };
  } catch (error) {
    return { props: { lyric: null, relatedLyrics: [], slug, error: 'Server error.' } };
  }
};

export default ViewLyrics;