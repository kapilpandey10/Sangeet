import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import from the centralized supabaseClient file
import { FaMusic } from 'react-icons/fa';
import { Helmet } from 'react-helmet'; // Import React Helmet
import Verified from './verified';
import '../style/ViewLyrics.css';
import BannerAd1 from './BannerAd1'; // Import the BannerAd1 component

const ViewLyrics = () => {
  const { title } = useParams(); // Get title from URL
  const [lyric, setLyric] = useState(null);
  const [relatedLyrics, setRelatedLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const adRef = useRef(null);

  // Replace underscores with spaces
  const formattedTitle = title.replace(/_/g, ' ');

  useEffect(() => {
    const fetchLyric = async () => {
      try {
        // Fetch the lyric based on the title (case-insensitive query)
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .ilike('title', formattedTitle) // Case-insensitive query for title
          .single();

        if (error || !data) {
          throw new Error('Lyrics not found or not approved.');
        }

        setLyric(data);
        fetchRelatedLyrics(data.artist); // Fetch related lyrics by the same artist
      } catch (error) {
        console.error('Error fetching lyric:', error);
        setError("Failed to fetch lyric or lyric not approved.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedLyrics = async (artist) => {
      try {
        const { data: artistLyrics, error } = await supabase
          .from('lyrics')
          .select('*')
          .ilike('artist', artist) // Case-insensitive match for related lyrics
          .neq('title', formattedTitle) // Exclude the current song
          .limit(3); // Fetch up to 3 related lyrics by the same artist

        if (error) {
          throw error;
        }

        setRelatedLyrics(artistLyrics);
      } catch (error) {
        console.error('Error fetching related lyrics:', error);
        setRelatedLyrics([]);
      }
    };

    fetchLyric();

    if (adRef.current && !adRef.current.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current.classList.add('adsbygoogle-initialized');
    }
  }, [title]);

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
      <div className="music-video">
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

  if (loading) {
    return <p>Loading the lyrics of {formattedTitle}...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="view-lyrics-container">
      <BannerAd1 />
      <Helmet>
        <title>{lyric ? `${lyric.title} Lyrics - ${lyric.artist}` : 'Lyrics'}</title>
        <meta
          name="description"
          content={lyric ? `Read the lyrics of ${lyric.title} by ${lyric.artist}. Enjoy the lyrics of this amazing song and explore more music by ${lyric.artist}.` : 'Lyrics of popular songs.'}
        />
        <meta
          name="keywords"
          content={lyric ? `${lyric.title} lyrics, ${lyric.artist} song, viral song of ${lyric.title}, ${lyric.lyrics.slice(0, 10)}, lyrics, song lyrics, music` : 'song lyrics, music, popular songs'}
        />
        <meta
          property="og:title"
          content={lyric ? `${lyric.title} by ${lyric.artist} - Sangeet Central || Pandey Kapil` : 'Song Lyrics'}
        />
        <meta
          property="og:description"
          content={lyric ? `Check out the full lyrics of "${lyric.title}" by ${lyric.artist}.` : 'Explore our collection of song lyrics.'}
        />

        {/* Add Music Recording Schema */}
        {lyric && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicRecording",
              "name": lyric.title,
              "byArtist": {
                "@type": "MusicGroup",
                "name": lyric.artist
              },
              "inAlbum": {
                "@type": "MusicAlbum",
                "name": "Album Name" // You can dynamically fetch this if available
              },
              "datePublished": lyric.published_date, // Date format should be YYYY-MM-DD
              "lyrics": lyric.lyrics,
              "url": window.location.href,
              "identifier": window.location.href
            })}
          </script>
        )}
        
      </Helmet>

      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Release Year:</strong> {new Date(lyric.published_date).getFullYear()}</p> {/* Display release year */}
          <p><strong>Added By:</strong> {lyric.added_by}</p> {/* Display added_by */}
          {lyric.status === 'approved' && <Verified />} {/* Display verified badge if approved */}
          <pre className="lyrics-text">{lyric.lyrics}</pre>
          {lyric.music_url && renderYouTubeEmbed(lyric.music_url)}

          {/* Display related lyrics (You May Also Like) */}
          {relatedLyrics.length > 0 && (
            <div className="related-lyrics">
              <BannerAd1 />
              <h3>You May Also Like</h3>
              <div className="related-lyrics-grid">
                {relatedLyrics.map((relatedLyric) => (
                  <Link
                    to={`/lyrics/${relatedLyric.title.replace(/\s+/g, '_')}`} // Update the related lyrics URL
                    key={relatedLyric.id}
                    className="related-lyric-item"
                  >
                    <div className="related-lyric-icon">
                      <FaMusic size={40} />
                    </div>
                    <div className="related-lyric-info">
                      <h4>{relatedLyric.title}</h4>
                      <p>{relatedLyric.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Lyrics not found.</p>
      )}
    </div>
  );
};

export default ViewLyrics;
