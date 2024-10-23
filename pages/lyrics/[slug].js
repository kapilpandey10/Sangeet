import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js router
import Link from 'next/link'; // Use Next.js Link component
import { supabase } from '../../supabaseClient';
import { FaMusic, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head'; // Use Next.js Head for SEO
import Verified from './verified'; // Adjust the import path if necessary
import FloatingModal from '../../components/FloatingModal'; // Adjust the import path if necessary
import styles from './style/ViewLyrics.module.css'; // Use CSS Module for styling

const ViewLyrics = () => {
  const router = useRouter();
  let { slug } = router.query; // Get slug from URL
  const [lyric, setLyric] = useState(null);
  const [relatedLyrics, setRelatedLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnglish, setIsEnglish] = useState(true); // Default to English version

  useEffect(() => {
    if (slug) {
      slug = slug.toLowerCase(); // Convert slug to lowercase for case-insensitive matching
      const fetchLyric = async () => {
        try {
          // Case-insensitive slug matching using ilike
          const { data, error } = await supabase
            .from('lyrics')
            .select('*')
            .ilike('slug', slug) // Make slug query case-insensitive
            .single();

          if (error || !data) {
            throw new Error('Lyrics not found or not approved.');
          }

          setLyric(data);
          fetchRandomLyrics(); // Fetch related lyrics
        } catch (err) {
          console.error('Error fetching lyric:', err); // Improved error logging
          setError('Failed to fetch lyric or lyric not approved. Please use the search box from Navbar. I guarantee you will find it.');
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
            .eq('status', 'approved') // Fetch only approved lyrics
            .limit(5); // Adjust to 5 related lyrics

          if (error) {
            throw new Error('Failed to fetch related lyrics.');
          }

          const shuffledLyrics = randomLyrics.sort(() => 0.5 - Math.random()).slice(0, 5);
          setRelatedLyrics(shuffledLyrics);
        } catch (err) {
          console.error('Error fetching related lyrics:', err); // Improved error logging
          setRelatedLyrics([]);
        }
      };

      fetchLyric();
    }
  }, [slug]);

  if (loading) {
    return <div className={styles.skeletonLoader}>Loading...</div>; // Improved loading state with CSS
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>; // Improved error message
  }

  const handleToggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  return (
    <div className={styles.viewLyricsPage}>
      <Head>
        <title>{lyric.title} Lyrics - by {lyric.artist}: Dynabeat</title>
        <meta name="description" content={`${lyric.description}` || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`} />
        <meta property="og:title" content={`${lyric.title} Lyrics by ${lyric.artist}`} />
        <meta property="og:description" content={lyric.description || `Read the lyrics of ${lyric.title} by ${lyric.artist}.`} />
        <meta property="og:image" content={lyric.thumbnail_url || '/default_thumbnail.png'} />
        <meta property="og:url" content={`https://pandeykapil.com.np/lyrics/${slug}`} />
        <meta property="og:type" content="music.song" />
        <link rel="canonical" href={`https://pandeykapil.com.np/lyrics/${slug?.toLowerCase()}`} /> {/* Case-insensitive canonical */}
      </Head>

      <div className={styles.lyricsContent}>
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link> / <Link href="/lyrics">Lyrics List</Link> / {lyric.title}
        </nav>

        <div className={styles.lyricsHeader}>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Release Year:</strong> {new Date(lyric.published_date).getFullYear()}</p>
          <p><strong>Added By:</strong> {lyric.added_by}</p>
          {lyric.status === 'approved' && <Verified />}
        </div>

        <button onClick={handleToggleLanguage} className={styles.toggleButton}>
          {isEnglish ? 'View Original Lyrics' : 'View English Lyrics'}
        </button>

        <pre className={styles.lyricsText}>
          {isEnglish
            ? (lyric.english_lyrics ? lyric.english_lyrics : 'Admin will soon put English lyrics for this song.')
            : lyric.lyrics}
        </pre>

        {lyric.music_url && (
          <div className={styles.musicVideo}>
            <iframe
              loading="lazy" // Lazy load the YouTube video for performance optimization
              src={`https://www.youtube.com/embed/${extractYouTubeId(lyric.music_url)}`}
              title="YouTube video player"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className={styles.socialShareButtons}>
          <a href={`https://twitter.com/intent/tweet?text=Check out these lyrics: ${lyric.title} - ${lyric.artist} &url=https://pandeykapil.com.np/lyrics/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.socialButton}>
            <FaTwitter />
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=https://pandeykapil.com.np/lyrics/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.socialButton}>
            <FaFacebook />
          </a>
          <a href={`https://api.whatsapp.com/send?text=Check out these lyrics: ${lyric.title} - ${lyric.artist} https://pandeykapil.com.np/lyrics/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.socialButton}>
            <FaWhatsapp />
          </a>
        </div>

        <FloatingModal />
      </div>

      <aside className={styles.relatedLyrics}>
        <h3>More Songs You Might Like</h3>
        <div className={styles.relatedLyricsGrid}>
          {relatedLyrics.map((relatedLyric) => (
            <Link href={`/lyrics/${relatedLyric.slug}`} key={relatedLyric.id}>
              <div className={styles.relatedLyricItem}>
                <div className={styles.relatedLyricIcon}>
                  <FaMusic size={20} aria-hidden="true" />
                </div>
                <div className={styles.relatedLyricInfo}>
                  <h4>{relatedLyric.title}</h4>
                  <p>{relatedLyric.artist}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default ViewLyrics;
