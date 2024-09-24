import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaMusic } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import Verified from './verified';
import FloatingModal from './FloatingModal';
import '../style/ViewLyrics.css';

const ViewLyrics = () => {
  const { title } = useParams(); // Get title from URL
  const [lyric, setLyric] = useState(null);
  const [relatedLyrics, setRelatedLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnglish, setIsEnglish] = useState(false); // Toggle between original and English
  const formattedTitle = title.replace(/_/g, ' ');

  useEffect(() => {
    const fetchLyric = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*') // Fetch both original and English lyrics
          .ilike('title', formattedTitle)
          .single();

        if (error || !data) {
          throw new Error('Lyrics not found or not approved.');
        }

        setLyric(data);
        fetchRelatedLyrics(data.artist);
      } catch (error) {
        setError("Failed to fetch lyric or lyric not approved.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedLyrics = async (artist) => {
      try {
        const { data: artistLyrics } = await supabase
          .from('lyrics')
          .select('*')
          .ilike('artist', artist)
          .neq('title', formattedTitle)
          .limit(3);

        setRelatedLyrics(artistLyrics);
      } catch {
        setRelatedLyrics([]);
      }
    };

    fetchLyric();
  }, [title]);

  // Toggle between Original and English Lyrics
  const handleToggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  // Extract YouTube video ID from a URL
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  if (loading) return <p>Loading the lyrics of {formattedTitle}...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="view-lyrics-container">
      <Helmet>
        <title>{lyric ? `${lyric.title} Lyrics - by ${lyric.artist}: Sangeet Lyrics Central` : 'Lyrics'}</title>
        <meta
          name="description"
          content={lyric ? `Read the lyrics of ${lyric.title} by ${lyric.artist} on Sangeet Lyrics Central. Explore more songs by ${lyric.artist}.` : 'Lyrics of popular songs.'}
        />
        <link rel="canonical" href={`https://pandeykapil.com.np/lyrics/${title}`} />
      </Helmet>

      {lyric && (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Release Year:</strong> {new Date(lyric.published_date).getFullYear()}</p>
          <p><strong>Added By:</strong> {lyric.added_by}</p>
          <FloatingModal /> {/* Modal will appear automatically */}

          {lyric.status === 'approved' && <Verified />}

          {/* Toggle Button */}
          <button onClick={handleToggleLanguage}>
            {isEnglish ? 'View Original Lyrics' : 'View English Lyrics'}
          </button>

          {/* Display Lyrics: Either Original or English */}
          <pre className="lyrics-text">
            {isEnglish 
              ? (lyric.lyrics_en ? lyric.lyrics_en : 'Admin will soon put English lyrics for this song.') 
              : lyric.lyrics}
          </pre>

          {/* YouTube Video Embed */}
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

          {/* Related Lyrics */}
          {relatedLyrics.length > 0 && (
            <div className="related-lyrics">
              <h3>You May Also Like</h3>
              <div className="related-lyrics-grid">
                {relatedLyrics.map((relatedLyric) => (
                  <Link
                    to={`/lyrics/${relatedLyric.title.replace(/\s+/g, '_')}`}
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
      )}
    </div>
  );
};

export default ViewLyrics;
