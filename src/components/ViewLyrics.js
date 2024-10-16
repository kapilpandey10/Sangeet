import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaMusic, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import Verified from './verified';
import FloatingModal from './FloatingModal';
import '../style/ViewLyrics.css';
import HotNews from './hotnews';

const ViewLyrics = () => {
  const { slug } = useParams(); // Get slug from URL
  const [lyric, setLyric] = useState(null);
  const [relatedLyrics, setRelatedLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnglish, setIsEnglish] = useState(true); // Default to English version

  useEffect(() => {
    const fetchLyric = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          throw new Error('Lyrics not found or not approved.');
        }

        setLyric(data);
        fetchRandomLyrics(); // Fetch 5 random lyrics
      } catch (error) {
        setError("Failed to fetch lyric or lyric not approved.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRandomLyrics = async () => {
      try {
        const { data: randomLyrics, error } = await supabase
          .from('lyrics')
          .select('*')
          .neq('slug', slug)
          .limit(10); // Fetch more than 5 to ensure randomness

        if (error) {
          throw new Error('Failed to fetch random lyrics.');
        }

        const shuffledLyrics = randomLyrics.sort(() => 0.5 - Math.random()).slice(0, 5);
        setRelatedLyrics(shuffledLyrics);
      } catch (error) {
        setRelatedLyrics([]);
      }
    };

    fetchLyric();
  }, [slug]);

  // Load Google Ads script when component mounts
  useEffect(() => {
    const loadAds = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Ads failed to load', e);
      }
    };

    loadAds(); // Load ads when the component is mounted
  }, []);

  if (error) {
    return <Navigate to="/404" />;
  }

  const handleToggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  if (loading) {
    return (
      <div className="skeleton-loader">
        <div className="skeleton-title"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-video"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-video"></div>
      </div>
    );
  }

  return (
    <div className="view-lyrics-page">
      <Helmet>
        {/* Page title and dynamic Open Graph tags */}
        <title>{lyric.title} Lyrics - by {lyric.artist}: Dynabeat</title>
        <meta name="description" content={lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist} on Dynabeat.`} />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta property="og:description" content={lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`} />
        <meta property="og:image" content={lyric.thumbnail_url || 'https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp'} />
        <meta property="og:url" content={`https://pandeykapil.com.np/lyrics/${slug}`} />
        <meta property="og:type" content="music.song" />
        <link rel="canonical" href={`https://pandeykapil.com.np/lyrics/${slug}`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicComposition",
            "name": lyric.title,
            "composer": lyric.artist,
            "inLanguage": lyric.language,
            "datePublished": new Date(lyric.published_date).toISOString(),
            "url": `https://pandeykapil.com.np/lyrics/${slug}`,
            "description": lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`,
          })}
        </script>
      </Helmet>

      <div className="lyrics-content">
        <div className="main-lyrics">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> / <Link to="/lyrics-list">Lyrics List</Link> / {lyric.title}
          </nav>

          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Release Year:</strong> {new Date(lyric.published_date).getFullYear()}</p>
          <p><strong>Added By:</strong> {lyric.added_by}</p>
          <FloatingModal />

          {lyric.status === 'approved' && <Verified />}

          <button onClick={handleToggleLanguage} className="toggle-button">
            {isEnglish ? 'View Original Lyrics' : 'View English Lyrics'}
          </button>

          <pre className="lyrics-text">
            {isEnglish 
              ? (lyric.english_lyrics ? lyric.english_lyrics : 'Admin will soon put English lyrics for this song.') 
              : lyric.lyrics}
          </pre>

          {lyric.music_url && (
            <div className="music-video">
              <iframe
                width="715"
                height="515"
                src={`https://www.youtube.com/embed/${extractYouTubeId(lyric.music_url)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="social-share-buttons">
            <a
              href={`https://twitter.com/intent/tweet?text=Check out these lyrics: ${lyric.title} - ${lyric.artist} &url=https://pandeykapil.com.np/lyrics/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://pandeykapil.com.np/lyrics/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=Check out these lyrics: ${lyric.title} - ${lyric.artist} https://pandeykapil.com.np/lyrics/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
            </a>
          </div>
          <HotNews />
        </div>

        <aside className="related-lyrics">
          <h3>More Songs You Might Like</h3>
          <div className="related-lyrics-grid">
            {relatedLyrics.map((relatedLyric) => (
              <Link
                to={`/lyrics/${relatedLyric.slug}`}
                key={relatedLyric.id}
                className="related-lyric-item"
              >
                <div className="related-lyric-icon">
                  <FaMusic size={20} aria-hidden="true" />
                </div>
                <div className="related-lyric-info">
                  <h4>{relatedLyric.title}</h4>
                  <p>{relatedLyric.artist}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* Google Auto Ads Integration */}
      <div className="google-ads">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9887409333966239"
          data-ad-slot="3428921840"
          data-ad-format="autorelaxed"></ins>
      </div>
    </div>
  );
};

export default ViewLyrics;
