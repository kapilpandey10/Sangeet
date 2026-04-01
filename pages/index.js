// File location: pages/index.jsx
// Drop-in replacement — keeps all your existing data fetching intact.

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from '../styles/HomePage.module.css';

const HomeYTVideo        = dynamic(() => import('./homeytvideo'),             { ssr: false });
const FeaturedArtistCard = dynamic(() => import('./FeaturedArtistCard'),      { ssr: false });
const NewRelease         = dynamic(() => import('../components/NewRelease'),  { ssr: false });

// ── Ad Components ─────────────────────────────────────────────────────────────

// Standard display ads (non-intrusive, tucked between sections)
const AdSlot = ({ slotId }) => (
  <div className={styles.adSlotWrap}>
    <p className={styles.adLabel}>Advertisement</p>
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-9887409333966239"
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
    <script
      dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }}
    />
  </div>
);

// Multiplex ad (grid of sponsored links — less intrusive than banner)
const MultiplexAd = ({ slotId }) => (
  <div className={styles.multiplexWrap}>
    <p className={styles.adLabel}>Sponsored</p>
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-9887409333966239"
      data-ad-slot={slotId}
      data-ad-format="autorelaxed"
    />
    <script
      dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }}
    />
  </div>
);

// ── Ticker words ──────────────────────────────────────────────────────────────
const TICKER_WORDS = [
  'LYRICS', 'ARTISTS', 'NEPALI MUSIC', 'DYNABEAT',
  'LYRICS', 'ARTISTS', 'HINDI MUSIC', 'DYNABEAT',
];

// ── Main component ────────────────────────────────────────────────────────────
const HomePage = ({ lyrics, featuredArtist }) => {
  const heroRef  = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.visible)),
      { threshold: 0.08 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DynaBeat',
    url: 'https://pandeykapil.com.np/',
    description: "Nepal's ultimate digital library for music lyrics, artist biographies, and live radio.",
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://pandeykapil.com.np/searchresults?query={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className={styles.homepageContainer}>
      <Head>
        <title>DynaBeat | Worldwide Music Lyrics, Artist Bios</title>
        <meta name="description" content="Discover thousands of Nepali music lyrics, explore detailed artist biographies, and stream live radio globally." />
        <meta name="keywords" content=" Music Lyrics, Music Lyrics, Nepali Song Lyrics, Live Radio Nepal, Nepali Artist Biography, DynaBeat Music" />
        <link rel="canonical" href="https://pandeykapil.com.np/" />
        <meta property="og:title" content="DynaBeat | Ultimate Nepali Music & Radio Library" />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>

      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />

      {/* ── HERO ── */}
      <header className={styles.hero} ref={heroRef}>
        <div className={styles.heroNoise} style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className={styles.heroGrid} />
        <div className={styles.heroAccentA} style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className={styles.heroAccentB} style={{ transform: `translateY(${scrollY * 0.2}px)` }} />

        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroDot} />
            Music Archive
          </p>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>DYNA</span>
            <span className={styles.heroTitleLine2}><em>Beat</em></span>
          </h1>

          <p className={styles.heroSub}>Lyrics · Artist Biographies </p>

          <div className={styles.heroCtas}>
            <Link href="/viewlyrics" className={styles.ctaPrimary}>Browse Lyrics</Link>
           
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>10K+</span>
              <span className={styles.heroStatLabel}>Lyrics</span>
            </div>
            <div className={styles.heroStatDiv} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>500+</span>
              <span className={styles.heroStatLabel}>Artists</span>
            </div>
            <div className={styles.heroStatDiv} />
            <div className={styles.heroStat}>
            </div>
          </div>
        </div>

        <div className={styles.heroScroll}>
          <span>Scroll</span>
          <div className={styles.heroScrollLine} />
        </div>
      </header>

      {/* ── TICKER ── */}
      <div className={styles.ticker} aria-hidden>
        <div className={styles.tickerTrack}>
          {TICKER_WORDS.map((w, i) => (
            <span key={i} className={styles.tickerItem}>
              {w} <span className={styles.tickerSep}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <main className={styles.main}>

        {/* ── TRENDING LYRICS ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>— Trending Now</p>
              <h2 className={styles.sectionTitle}>Popular Lyrics</h2>
            </div>
            <Link href="/viewlyrics" className={styles.sectionLink}>All Lyrics <span>→</span></Link>
          </div>

          <div className={styles.lyricsGrid}>
            {lyrics.map((lyric, i) => (
              <Link
                href={`/viewlyrics/${lyric.slug}`}
                key={lyric.id}
                className={styles.lyricCard}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={styles.lyricCardImg}>
                  <Image
                    src={lyric.thumbnail_url?.trim() || '/logo/logo.webp'}
                    alt={`Lyrics for ${lyric.title}`}
                    fill
                    className={styles.lyricImg}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={styles.lyricCardOverlay}>
                    <span className={styles.lyricPlay}>▶</span>
                  </div>
                  <span className={styles.lyricCardNum}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className={styles.lyricCardBody}>
                  <h3 className={styles.lyricTitle}>{lyric.title}</h3>
                  <p className={styles.lyricArtist}>{lyric.artist}</p>
                  <span className={styles.lyricYear}>
                    {lyric.published_date ? new Date(lyric.published_date).getFullYear() : '2026'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AD 1: After lyrics, before new releases (slot 6790262526) ── */}
        <AdSlot slotId="6790262526" />

        {/* ── NEW RELEASES ── */}
        <section className={`${styles.section} ${styles.reveal}`}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>— Fresh Drops</p>
            </div>
          </div>
          <NewRelease />
        </section>

        {/* ── AD 2: After new releases (slot 7959039819) ── */}
        <AdSlot slotId="7959039819" />

        {/* ── VIDEO ── */}
        <section className={`${styles.videoSection} ${styles.reveal}`}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>— Watch</p>
              <h2 className={styles.sectionTitle}>LIVE DYNABEAT TV</h2>
            </div>
          </div>
          <HomeYTVideo />
        </section>

        {/* ── AD 3: After video (slot 9138486045) ── */}
        <AdSlot slotId="9138486045" />

        {/* ── ARTIST SPOTLIGHT ── */}
        {featuredArtist && (
          <section className={`${styles.artistSpotlight} ${styles.reveal}`}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.sectionEyebrow}>— Featured</p>
                <h2 className={styles.sectionTitle}>Artist Spotlight</h2>
              </div>
            </div>
            <FeaturedArtistCard artist={featuredArtist} />
          </section>
        )}

        {/* ── MULTIPLEX AD: At the bottom before SEO article (slot 3428921840) ── */}
        <MultiplexAd slotId="3428921840" />

        {/* ── SEO ARTICLE ── */}
        <article className={`${styles.seoArticle} ${styles.reveal}`}>
          <div className={styles.seoInner}>
            <div className={styles.seoRule} />
            <h2>DynaBeat: Premier Music Archive</h2>
            <p>
              Welcome to <strong>DynaBeat</strong> — the most comprehensive digital hub for music lovers.
              From verified <strong> song lyrics</strong> to in-depth <strong>artist biographies</strong>,
              we are building the definitive record of musical culture.
            </p>
          
          </div>
        </article>

      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const { data: allLyrics } = await supabase
      .from('lyrics')
      .select('id, title, artist, published_date, slug, thumbnail_url')
      .eq('status', 'approved');

    const lyrics = allLyrics
      ? [...allLyrics].sort(() => 0.5 - Math.random()).slice(0, 6)
      : [];

    const { data: artistData } = await supabase
      .from('artists')
      .select('*')
      .eq('status', 'approved');

    const featuredArtist =
      artistData?.length > 0
        ? artistData[Math.floor(Math.random() * artistData.length)]
        : null;

    return { props: { lyrics, featuredArtist } };
  } catch {
    return { props: { lyrics: [], featuredArtist: null } };
  }
};

export default HomePage;