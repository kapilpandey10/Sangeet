import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import from the centralized supabaseClient file
import { Helmet } from 'react-helmet';
import '../style/ArtistBio.css';
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

        // Fetch 2 random artists with status 'approved'
        const { data: relatedData, error: relatedError } = await supabase
          .from('artists')
          .select('name, image_url, bio')
          .eq('status', 'approved')
          .neq('name', decodeURIComponent(name)) // Exclude the current artist
          .order('random()', { ascending: false })
          .limit(2); // Fetch 2 random artists

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
    if (!videoId) {
      return null;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
      <div className="artist-video">
        <iframe
          width="100%"
          height="450px"
          src={embedUrl}
          title="YouTube video player"
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

      <h1>{artist.name}</h1>
      <img src={artist.image_url} alt={artist.name} className="artist-image" loading="lazy" />

      <div className="artist-bio">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(artist.bio) }}></div>
      </div>

      {artist.video_url && renderYouTubeEmbed(artist.video_url)}

      {/* You May Also Like Section */}
      <div className="related-artists-section">
        <h2>You May Also Like</h2>
        {relatedArtists.length > 0 ? (
          <div className="related-artists-grid">
            {relatedArtists.map((relatedArtist) => (
              <div key={relatedArtist.name} className="related-artist-card">
                <Link to={`/artistbio/${encodeURIComponent(relatedArtist.name)}`}>
                  <img src={relatedArtist.image_url} alt={relatedArtist.name} className="related-artist-image" loading="lazy" />
                  <h3>{relatedArtist.name}</h3>
                  <p className="artist-description">{relatedArtist.bio.substring(0, 100)}...</p> {/* Display the first 100 characters of bio */}
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
