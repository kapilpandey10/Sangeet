import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaMusic } from 'react-icons/fa';
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

        if (error) {
          throw error;
        }

        setLyric(data);
        fetchRelatedLyrics(data.artist);
      } catch (error) {
        console.error('Error fetching lyric:', error);
        setError("Failed to fetch lyric.");
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

        if (artistLyrics.length < 3) {
          const { data: otherLyrics, error: otherError } = await supabase
            .from('lyrics')
            .select('*')
            .neq('id', id)
            .neq('artist', artist)
            .order('published_date', { ascending: false })
            .limit(3 - artistLyrics.length);

          if (otherError) {
            throw otherError;
          }

          setRelatedLyrics([...artistLyrics, ...otherLyrics]);
        } else {
          setRelatedLyrics(artistLyrics);
        }
      } catch (error) {
        console.error('Error fetching related lyrics:', error);
        setRelatedLyrics([]);
      }
    };

    fetchLyric();

    if (adRef.current && !adRef.current.classList.contains('adsbygoogle-initialized')) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current.classList.add('adsbygoogle-initialized'); // Mark the ad as initialized
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

  return (
    <div className="view-lyrics-container">
      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Lyrics Writer:</strong> {lyric.lyrics_writer}</p> {/* Display the lyrics writer */}
          <p><strong>Published Date:</strong> {lyric.published_date}</p>
          <pre className="lyrics-text">{lyric.lyrics}</pre> {/* Larger text size */}
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
              ref={adRef} // Attach ref to the ad element
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
