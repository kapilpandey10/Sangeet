
// File: pages/viewlyrics/[slug].jsx

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';
import { FaMusic, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Verified from './verified';
import FloatingModal from '../../components/FloatingModal';
import styles from './style/ViewLyrics.module.css';
import MonetagAd from "../../components/MonetagAd";

const ViewLyrics = ({ lyric, relatedLyrics = [], slug, error }) => {
  const [isEnglish, setIsEnglish] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const youtubeRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Adsense error:', e);
      }
    }
  }, [isMounted]);

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

  return (
    <div className={styles.viewLyricsPage}>
      <Head>
        <title>{`${lyric.title} Lyrics - by ${lyric.artist}: Dynabeat`}</title>
        <meta
          name="description"
          content={
            lyric.description ||
            `Read the lyrics of ${lyric.title} by ${lyric.artist}.`
          }
        />
        <meta property="og:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta
          property="og:description"
          content={
            lyric.description ||
            `Read the lyrics of ${lyric.title} by ${lyric.artist}.`
          }
        />
        <meta
          property="og:image"
          content={lyric.thumbnail_url || '/default_thumbnail.png'}
        />
        <meta
          property="og:url"
          content={`https://pandeykapil.com.np/lyrics/${slug.toLowerCase()}`}
        />
        <meta property="og:type" content="music.song" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta
          name="twitter:description"
          content={
            lyric.description ||
            `Read the lyrics of ${lyric.title} by ${lyric.artist}.`
          }
        />
        <meta
          name="twitter:image"
          content={lyric.thumbnail_url || '/default_thumbnail.png'}
        />

        <link
          rel="canonical"
          href={`https://pandeykapil.com.np/lyrics/${slug.toLowerCase()}`}
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicRecording",
              "name": lyric.title,
              "byArtist": {
                "@type": "MusicGroup",
                "name": lyric.artist,
              },
              "url": `https://pandeykapil.com.np/lyrics/${slug.toLowerCase()}`,
              "image": lyric.thumbnail_url || "https://pandeykapil.com.np/default_thumbnail.png",
              "description": lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`,
              "datePublished": lyric.published_date || new Date().toISOString(),
              "inLanguage": isEnglish ? "en" : "original_language_code", // Replace with actual language code if available
            }),
          }}
        />

        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9887409333966239"
          crossOrigin="anonymous"
        ></script>
      </Head>

      {/* Top Ad */}
      {isMounted && (
        <div className={styles.adContainer}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px' }}
            data-ad-client="ca-pub-9887409333966239"
            data-ad-slot="6720877169"  // Replace with your top ad slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      )}

      <div className={styles.lyricsContent}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>{' '}
          /{' '}
          <Link href="/lyrics" className={styles.breadcrumbLink}>
            Lyrics List
          </Link>{' '}
          / <span aria-current="page">{lyric.title}</span>
        </nav>

        <div className={styles.lyricsHeader}>
          {lyric.thumbnail_url && (
            <img
              src={lyric.thumbnail_url}
              alt={`${lyric.title} thumbnail`}
              className={styles.thumbnail}
              onClick={scrollToYoutube}
              loading="lazy"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') scrollToYoutube();
              }}
            />
          )}
          <h1>{lyric.title}</h1>
          <p>
            <strong>Artist:</strong> {lyric.artist}
          </p>
          <p>
            <strong>Release Year:</strong>{' '}
            {lyric.published_date
              ? new Date(lyric.published_date).getFullYear()
              : 'N/A'}
          </p>
          <p>
            <strong>Added By:</strong> {lyric.added_by}
          </p>
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

        {/* Middle Ad */}
       <MonetagAd/>

        {youtubeId && (
          <div ref={youtubeRef} className={styles.musicVideo}>
            <iframe
              loading="lazy"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={`${lyric.title} Music Video`}
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className={styles.socialShareButtons}>
          <a
            href={`https://twitter.com/intent/tweet?text=Check out these lyrics: ${encodeURIComponent(
              lyric.title
            )} - ${encodeURIComponent(lyric.artist)}&url=https://pandeykapil.com.np/lyrics/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
            aria-label="Share on Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://pandeykapil.com.np/lyrics/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
            aria-label="Share on Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=Check out these lyrics: ${encodeURIComponent(
              lyric.title
            )} - ${encodeURIComponent(
              lyric.artist
            )} https://pandeykapil.com.np/lyrics/${slug}`}
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
                href={`/lyrics/${relatedLyric.slug}`}
                key={relatedLyric.id}
                className={styles.relatedLyricItem}
              >
                {relatedLyric.thumbnail_url && (
                  <img
                    src={relatedLyric.thumbnail_url}
                    alt={`${relatedLyric.title} thumbnail`}
                    className={styles.relatedThumbnail}
                    loading="lazy"
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
       <MonetagAd/>

      {/* Bottom Ad */}
      {isMounted && (
        <div className={styles.adContainer}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px' }}
            data-ad-client="ca-pub-9887409333966239"
            data-ad-slot="1039665871" // Replace with your bottom ad slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      )}
    </div>
  );
};

// Server-Side Data Fetching
export const getServerSideProps = async (context) => {
  const { slug } = context.params;

  try {
    const { data: lyric, error } = await supabase
      .from('lyrics')
      .select('*')
      .ilike('slug', slug.toLowerCase())
      .single();

    if (error || !lyric) {
      throw new Error('Lyrics not found or not approved.');
    }

    const { data: relatedLyrics, error: relatedError } = await supabase
      .from('lyrics')
      .select('*')
      .neq('slug', slug.toLowerCase())
      .eq('status', 'approved')
      .limit(5);

    if (relatedError) {
      console.warn(
        'Error fetching related lyrics:',
        relatedError.message || relatedError
      );
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
    console.warn('Error fetching lyric:', error.message || error);
    return {
      props: {
        lyric: null,
        relatedLyrics: [],
        slug,
        error:
          'Failed to fetch lyric or lyric not approved. Please use the search box from Navbar. I guarantee you will find it.',
      },
    };
  }
};

export default ViewLyrics;
