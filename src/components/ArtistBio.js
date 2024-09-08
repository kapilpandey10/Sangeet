import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import '../style/ArtistBio.css';
import DOMPurify from 'dompurify';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ArtistBio = () => {
  const { name } = useParams(); // Get artist name from URL params
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('name', decodeURIComponent(name))
          .single();

        if (error) throw error;
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist bio:', error);
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
    if (!videoId) {
      return null;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
      <div className="artist-video">
        <iframe
          width="715"
          height="515"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  if (loading) return <p>Loading artist bio...</p>;

  if (!artist) return <p>Artist not found</p>;

  return (
    <div className="artist-bio-page">
      <h1>{artist.name}</h1>
      <img src={artist.image_url} alt={artist.name} className="artist-image" loading="lazy" />
      ""
      <div className="artist-bio">
        {/* Render sanitized HTML bio */}
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(artist.bio) }}></div>
      </div>
      {artist.video_url && renderYouTubeEmbed(artist.video_url)}
    </div>
  );
};

export default ArtistBio;
