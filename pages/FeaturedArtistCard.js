import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/FeaturedArtistCard.module.css';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FeaturedArtistCard = () => {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch one approved artist based on the day of the month
  const fetchFeaturedArtist = async () => {
    try {
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching artist:', error.message);
        return;
      }

      if (artists.length > 0) {
        const dayOfMonth = new Date().getDate();
        const artistIndex = dayOfMonth % artists.length;
        setArtist(artists[artistIndex]);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedArtist();
  }, []);

  useEffect(() => {
    if (artist) {
      const metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = `Learn more about ${artist.name}, a featured artist at Dynabeats. Discover their music, bio, and more.`;
      document.head.appendChild(metaDescription);

      const metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = `${artist.name}, artist, music, biography, lyrics, songs`;
      document.head.appendChild(metaKeywords);

      return () => {
        document.head.removeChild(metaDescription);
        document.head.removeChild(metaKeywords);
      };
    }
  }, [artist]);

  if (loading) {
    return <p>Loading featured artist...</p>;
  }

  if (!artist) {
    return <p>No featured artist found.</p>;
  }

  return (
    <div className={styles.artistFeature}>
      <div className={styles.artistCard}>
      <Image 
  src={artist.image_url || '/default-image.jpg'} // Fallback image if URL is missing
  alt={`Portrait of ${artist.name}`} 
  className={styles.artistCardImage} 
  width={300} 
  height={300} 
  loading="lazy" // Lazy load the image for better performance
/>

        <h3>{artist.name}</h3>
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(artist.bio.substring(0, 150)),
          }}
          aria-label={`Short biography of ${artist.name}`}
        ></p>
        <Link href={`/artistbio/${artist.name}`} legacyBehavior>
  <a>Read more about {artist.name}</a>
</Link>

      </div>
    </div>
  );
};

export default FeaturedArtistCard;
