import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify'; // For sanitizing HTML
import Link from 'next/link'; // Use Next.js Link component
import Image from 'next/image'; // Use Next.js optimized Image component
import styles from '../styles/FeaturedArtistCard.module.css'; // Ensure you have this CSS module

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FeaturedArtistCard = () => {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch one approved artist based on the day of the month
  const fetchFeaturedArtist = async () => {
    try {
      // Fetch all approved artists
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching artist:', error.message);
      } else if (artists.length > 0) {
        // Use the current day to select an artist (e.g., day of the month)
        const dayOfMonth = new Date().getDate();
        const artistIndex = dayOfMonth % artists.length; // Ensure index is within bounds
        const featuredArtist = artists[artistIndex];
        setArtist(featuredArtist);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Meta tags for SEO (description and keywords)
  useEffect(() => {
    fetchFeaturedArtist();

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
          src={artist.image_url} 
          alt={artist.name} 
          className={styles.artistCardImage} 
          width={300} 
          height={300} 
        />
        <h3>{artist.name}</h3>
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(artist.bio.substring(0, 150)), // Limit bio to 150 characters
          }}
        ></p>
        {/* Updated descriptive link using Next.js Link component */}
        <Link href={`/artistbio/${artist.name}`}>
          <a>Read more about {artist.name}</a> {/* Remove wrapping <a> tag */}
        </Link>
      </div>
    </div>
  );
};

export default FeaturedArtistCard;
