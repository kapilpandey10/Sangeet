// File: pages/viewlyrics/[slug].jsx

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import { supabase } from '../../supabaseClient';
import { FaMusic, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';

const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish] = useState(true);
  const youtubeRef = useRef(null);

  if (!lyric) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  const scrollToYoutube = () => {
    if (youtubeRef.current) {
      youtubeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const extractYouTubeId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const youtubeId = lyric.music_url ? extractYouTubeId(lyric.music_url) : null;
  const canonicalUrl = `https://pandeykapil.com.np/viewlyrics/${slug.toLowerCase()}`;
  const thumbnailUrl = lyric.thumbnail_url?.trim() || '/default_thumbnail.png';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "name": lyric.title,
    "url": canonicalUrl,
    "image": thumbnailUrl,
    "description": lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`,
    "datePublished": lyric.published_date || new Date().toISOString(),
    "byArtist": {
      "@type": "MusicGroup",
      "name": lyric.artist,
      "url": lyric.artist_url || "https://pandeykapil.com.np/viewlyrics"
    },
    "inLanguage": isEnglish ? "en" : (lyric.language || "en"),
    "lyrics": {
      "@type": "CreativeWork",
      "name": `Lyrics for ${lyric.title}`,
      "text": isEnglish ? lyric.english_lyrics : lyric.lyrics
    }
  };

  return (
    <>
      <Head>
        <title>{`${lyric.title} Lyrics by ${lyric.artist}`}</title>
        <meta
          name="description"
          content={
            lyric.description ||
            `Read the lyrics of ${lyric.title} by ${lyric.artist}.`
          }
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta property="og:description" content={lyric.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="music.song" />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${lyric.title} thumbnail`} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta name="twitter:description" content={lyric.description} />
        <meta name="twitter:image" content={thumbnailUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* AdSense Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

      <div className={styles.viewLyricsPage}>
        {/* Top Ad */}
        <div className={styles.adContainer}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px' }}
            data-ad-client="ca-pub-9887409333966239"
            data-ad-slot="6720877169"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>

        <div className={styles.lyricsContent}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link> /{' '}
            <Link href="/viewlyrics" className={styles.breadcrumbLink}>
              Lyrics List
            </Link> /{' '}
            <span aria-current="page">{lyric.title}</span>
          </nav>

          <div className={styles.lyricsHeader}>
            {lyric.thumbnail_url && (
              <Image
                src={lyric.thumbnail_url.trim()}
                alt={`${lyric.title} thumbnail`}
                className={styles.thumbnail}
                onClick={scrollToYoutube}
                loading="lazy"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') scrollToYoutube();
                }}
                width={200}
                height={200}
                quality={75}
              />
            )}
            <h1>{lyric.title}</h1>
            <p><strong>Artist:</strong> {lyric.artist}</p>
            <p>
              <strong>Release Year:</strong>{' '}
              {lyric.published_date
                ? new Date(lyric.published_date).getFullYear()
                : 'N/A'}
            </p>
            <p><strong>Added By:</strong> {lyric.added_by}</p>
            {lyric.status === 'approved' && <Verified />}
          </div>

          <button onClick={handleToggleLanguage} className={styles.toggleButton}>
            {isEnglish ? 'View Original Lyrics' : 'View English Lyrics'}
          </button>

          <pre className={styles.lyricsText}>
            {isEnglish
              ? lyric.english_lyrics ||
                'Admin will soon put English lyrics for this song.'
              : lyric.lyrics}
          </pre>

          {/* AdSense Ad Placement within the content */}
          <div className={styles.adContentContainer}>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '50px' }}
              data-ad-client="ca-pub-9887409333966239"
              data-ad-slot="9311234567" // Use a unique ad slot ID
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          {youtubeId && (
            <div ref={youtubeRef} className={styles.musicVideoContainer}>
              <iframe
                loading="lazy"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${lyric.title} Music Video`}
                allowFullScreen
              ></iframe>
              <div className={styles.youtubeOverlay}></div>
            </div>
          )}

          <div className={styles.socialShareButtons}>
            <a
              href={`https://twitter.com/intent/tweet?text=Check out these lyrics: ${encodeURIComponent(lyric.title)} - ${encodeURIComponent(lyric.artist)}&url=${canonicalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialButton}
              aria-label="Share on Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${canonicalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialButton}
              aria-label="Share on Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=Check out these lyrics: ${encodeURIComponent(lyric.title)} - ${encodeURIComponent(lyric.artist)} ${canonicalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialButton}
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>

          <FloatingModal />
        </div>

        {relatedLyrics.length > 0 ? (
          <aside className={styles.relatedLyrics}>
            <h3>More Songs You Might Like</h3>
            <div className={styles.relatedLyricsGrid}>
              {relatedLyrics.map((relatedLyric) => (
                <Link
                  href={`/viewlyrics/${relatedLyric.slug}`}
                  key={relatedLyric.id}
                  className={styles.relatedLyricItem}
                >
                  {relatedLyric.thumbnail_url && (
                    <Image
                      src={relatedLyric.thumbnail_url.trim()}
                      alt={`${relatedLyric.title} thumbnail`}
                      className={styles.relatedThumbnail}
                      width={100}
                      height={100}
                      quality={75}
                    />
                  )}
                  <div className={styles.relatedLyricInfo}>
                    <h4>{relatedLyric.title}</h4>
                    <p>{relatedLyric.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        ) : (
          <aside className={styles.relatedLyrics}>
            <h3>No related songs found.</h3>
          </aside>
        )}

        {/* Bottom Ad */}
        <div className={styles.adContainer}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px' }}
            data-ad-client="ca-pub-9887409333966239"
            data-ad-slot="1039665871"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </>
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
      console.warn('Lyric fetch failed for slug:', slug, 'Error:', error);
      return {
        props: {
          lyric: null,
          relatedLyrics: [],
          slug,
          error: 'Failed to fetch lyric or lyric not approved. Please use the search box from Navbar. I guarantee you will find it.',
        },
      };
    }

    const { data: relatedLyrics, error: relatedError } = await supabase
      .from('lyrics')
      .select('id, title, artist, thumbnail_url, slug')
      .neq('slug', slug.toLowerCase())
      .eq('status', 'approved')
      .limit(10);

    if (relatedError) {
      console.warn('Error fetching related lyrics:', relatedError.message || relatedError);
    }

    const shuffledLyrics = relatedLyrics
      ? relatedLyrics.sort(() => 0.5 - Math.random()).slice(0, 5)
      : [];

    return {
      props: {
        lyric,
        relatedLyrics: shuffledLyrics,
        slug,
        error: null,
      },
    };
  } catch (error) {
    console.error('An unexpected error occurred in getServerSideProps:', error);
    return {
      props: {
        lyric: null,
        relatedLyrics: [],
        slug,
        error: 'An unexpected error occurred. Please try again later or search for the song.',
      },
    };
  }
};

export default ViewLyrics;
