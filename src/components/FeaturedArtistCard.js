import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify'; // For sanitizing HTML
import { Link } from 'react-router-dom';
import '../style/FeaturedArtistCard.css'; // Ensure you have this CSS file

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FeaturedArtistCard = () => {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch one random approved artist
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
        // Select one random artist from the list of approved artists
        const randomArtist = artists[Math.floor(Math.random() * artists.length)];
        setArtist(randomArtist);
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

  if (loading) {
    return <p>Loading featured artist...</p>;
  }

  if (!artist) {
    return <p>No featured artist found.</p>;
  }

  return (
    <div className="artist-feature">
      <div className="artist-card">
        <img src={artist.image_url} alt={artist.name} className="artist-card-image" />
        <h3>{artist.name}</h3>
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(artist.bio.substring(0, 150)), // Limit bio to 150 characters
          }}
        ></p>
        <Link to={`/artistbio/${artist.name}`}>Read More</Link>
      </div>
    </div>
  );
};

export default FeaturedArtistCard;
