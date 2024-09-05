import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaMusic } from 'react-icons/fa';
import Verified from './verified';
import '../style/ViewLyrics.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ViewLyrics = () => {
  const { id } = useParams();
  const [lyric, setLyric] = useState(null);
  const [relatedLyrics, setRelatedLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const adRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setError("No ID provided for fetching lyrics.");
      setLoading(false);
      return;
    }

    const fetchLyric = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          throw new Error('Lyrics not found or not approved.');
        }

        setLyric(data);
        fetchRelatedLyrics(data.artist);
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
          .eq('artist', artist)
          .neq('id', id)
          .limit(3);

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
  }, [id]);

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const renderYouTubeEmbed = (videoUrl) => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      return null; // Ensure only a valid YouTube video URL is used
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
    return <p>Loading lyrics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="view-lyrics-container">
      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Lyrics Writer:</strong> {lyric.lyrics_writer}</p>      
          <p>
          <strong>Release Year:</strong> {new Date(lyric.published_date).getFullYear()}     
          </p>
          <p><strong>Added By:</strong> {lyric.added_by}</p> {/* Display added_by */}
          {lyric.status === 'approved' && <Verified />}
          <pre className="lyrics-text">{lyric.lyrics}</pre><br></br>
          <p><strong>Listen to this Music on YouTube</strong></p>
          {lyric.music_url && renderYouTubeEmbed(lyric.music_url)}

          {/* Google AdSense Ad */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9887409333966239"
              data-ad-slot="6720877169"
              data-ad-format="auto"
              data-full-width-responsive="true"
              ref={adRef}
            ></ins>
          </div>

          {relatedLyrics.length > 0 && (
            <div className="related-lyrics">
              <h3>You May Also Like</h3>
              <div className="related-lyrics-grid">
                {relatedLyrics.map((relatedLyric) => (
                  <Link to={`/lyrics/${relatedLyric.id}`} key={relatedLyric.id} className="related-lyric-item">
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
