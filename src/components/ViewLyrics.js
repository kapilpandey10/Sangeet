import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaMusic } from 'react-icons/fa';
import Verified from './verified';  // Correct import for Verified component
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
  const adRef = useRef(null);  // Reference to track ad initialization

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
        let { data: artistLyrics, error } = await supabase
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

  const renderYouTubeEmbed = (url) => {
    if (!url) return null;

    const embedUrl = url.replace("watch?v=", "embed/");
    return (
      <div className="music-video">
        <iframe
          width="560"
          height="315"
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

  // Extract only the year from the published_date
  const releaseYear = new Date(lyric.published_date).getFullYear();

  return (
    <div className="view-lyrics-container">
      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Lyrics Writer:</strong> {lyric.lyrics_writer}</p>
          <p>
            <strong>Release Year:</strong> {releaseYear}
            {lyric.status === 'approved' && <Verified />}
          </p>
          <p><strong>Added by:</strong> {lyric.added_by}</p> {/* Display who added the lyrics */}
          <pre className="lyrics-text">{lyric.lyrics}</pre> {/* Lyrics are now larger */}
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
}

export default ViewLyrics;
