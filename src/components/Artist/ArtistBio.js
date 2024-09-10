import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Helmet } from 'react-helmet';
import './style/ArtistBio.css';
import DOMPurify from 'dompurify';

const ArtistBio = () => {
  const { name } = useParams();
  const [artist, setArtist] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);
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
  
        // Fetch 2 random related artists with status 'approved'
        const { data: relatedData, error: relatedError } = await supabase
        .from('artists')
        .select('name, image_url, bio')
        .eq('status', 'approved')
        .order('random()', { ascending: false })
        .limit(2);
      
      console.log('Related artists without filtering:', relatedData);
      
        console.log('Related artists data:', relatedData); // Log related artists data
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
      <div className="artist-video">
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
    <div className="artist-bio-page">
      <Helmet>
        <title>{artist.name} - Bio Page | Sangeet Lyrics</title>
        <meta
          name="description"
          content={`Discover the biography of ${artist.name}, a popular Nepali music artist. Explore ${artist.name}'s songs, lyrics, and more.`}
        />
        <meta name="keywords" content={generateMetaKeywords(artist)} />
      </Helmet>

      <h1 className="artist-name">{artist.name}</h1>
      <img
        src={artist.image_url}
        alt={artist.name}
        className="artist-image"
        loading="lazy"
      />

      <div className="artist-bio">
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(artist.bio),
          }}
        ></div>
      </div>

      {artist.video_url && renderYouTubeEmbed(artist.video_url)}

      {/* Related Artists Section */}
      <div className="related-artists-section">
        <h2>You May Also Like</h2>
        {relatedArtists.length > 0 ? (
          <div className="related-artists-grid">
            {relatedArtists.map((relatedArtist) => (
              <div key={relatedArtist.name} className="related-artist-card">
                <Link
                  to={`/artistbio/${encodeURIComponent(relatedArtist.name)}`}
                >
                  <img
                    src={relatedArtist.image_url}
                    alt={relatedArtist.name}
                    className="related-artist-image"
                    loading="lazy"
                  />
                  <h3>{relatedArtist.name}</h3>
                  <p className="artist-description">
                    {DOMPurify.sanitize(relatedArtist.bio).substring(0, 100)}...
                  </p>
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
