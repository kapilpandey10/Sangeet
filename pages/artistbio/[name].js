import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js router
import { supabase } from '../../supabaseClient';
import Head from 'next/head'; // For SEO meta tags
import Link from 'next/link';
import DOMPurify from 'dompurify';
import styles from './style/ArtistBio.module.css'; // Import CSS Module

const ArtistBio = () => {
  const router = useRouter();
  const { name } = router.query; // Get artist's name from the dynamic URL
  const [artist, setArtist] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return; // Wait for the name to be available

    const fetchArtist = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('name', decodeURIComponent(name))
          .single();

        if (error) throw error;
        setArtist(data);

        // Fetch related artists
        const { data: relatedData, error: relatedError } = await supabase
          .from('artists')
          .select('name, image_url, bio')
          .eq('status', 'approved')
          .neq('name', name) // Exclude current artist
          .order('random()', { ascending: false })
          .limit(2);

        if (relatedError) throw relatedError;
        setRelatedArtists(relatedData);
      } catch (error) {
        console.error('Error fetching artist bio or related artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [name]);

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const renderYouTubeEmbed = (videoUrl) => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
      <div className={styles.artistVideo}>
        <iframe
          width="100%"
          height="600px"
          src={embedUrl}
          title={`${artist.name} - YouTube video`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  const generateMetaKeywords = (artist) => {
    if (!artist) return '';
    return `${artist.name}, ${artist.name} songs, ${artist.name} bio, Nepali music, ${artist.name} new songs, ${artist.name} dohori songs, ${artist.name} teej songs, ${artist.name} Biodata, Nepali music artist, Nepali songs, ${artist.name} biography`;
  };

  if (loading) return <p>Loading artist bio...</p>;
  if (!artist) return <p>Artist not found</p>;

  return (
    <div className={styles.artistBioPage}>
      <Head>
        <title>{artist.name} - Bio Page | Sangeet Lyrics</title>
        <meta
          name="description"
          content={`Discover the biography of ${artist.name}, a popular Nepali music artist. Explore ${artist.name}'s songs, lyrics, and more.`}
        />
        <meta name="keywords" content={generateMetaKeywords(artist)} />
      </Head>

      <h1 className={styles.artistName}>{artist.name}</h1>
      <img
        src={artist.image_url}
        alt={artist.name}
        className={styles.artistImage}
        loading="lazy"
      />

      <div className={styles.artistBio}>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(artist.bio),
          }}
        ></div>
      </div>

      {artist.video_url && renderYouTubeEmbed(artist.video_url)}

      {/* Related Artists Section */}
      <div className={styles.relatedArtistsSection}>
        <h2>You May Also Like</h2>
        {relatedArtists.length > 0 ? (
          <div className={styles.relatedArtistsGrid}>
            {relatedArtists.map((relatedArtist) => (
              <div key={relatedArtist.name} className={styles.relatedArtistCard}>
                <Link href={`/artistbio/${encodeURIComponent(relatedArtist.name)}`}>
                  <a>
                    <img
                      src={relatedArtist.image_url}
                      alt={relatedArtist.name}
                      className={styles.relatedArtistImage}
                      loading="lazy"
                    />
                    <h3>{relatedArtist.name}</h3>
                    <p className={styles.artistDescription}>
                      {DOMPurify.sanitize(relatedArtist.bio).substring(0, 100)}...
                    </p>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No related artists found.</p>
        )}
      </div>
    </div>
  );
};

export default ArtistBio;
