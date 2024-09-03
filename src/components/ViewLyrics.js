import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaMusic } from 'react-icons/fa'; // Import music icon
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

  useEffect(() => {
    const fetchLyric = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching lyric:', error);
      } else {
        setLyric(data);
        fetchRelatedLyrics(data.artist);
      }
    };

    const fetchRelatedLyrics = async (artist) => {
      let { data: artistLyrics, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('artist', artist)
        .neq('id', id)
        .limit(3); // Limit to 3 lyrics

      if (error) {
        console.error('Error fetching related lyrics by artist:', error);
        artistLyrics = [];
      }

      if (artistLyrics.length < 3) {
        const { data: otherLyrics, error: otherError } = await supabase
          .from('lyrics')
          .select('*')
          .neq('id', id)
          .neq('artist', artist)
          .order('published_date', { ascending: false }) // Sort by latest
          .limit(3 - artistLyrics.length);

        if (otherError) {
          console.error('Error fetching random lyrics:', otherError);
        }

        setRelatedLyrics([...artistLyrics, ...otherLyrics]);
      } else {
        setRelatedLyrics(artistLyrics);
      }
    };

    fetchLyric();

    // Initialize Google Ads
    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, [id]);

  const renderYouTubeEmbed = (url) => {
    const embedUrl = url.includes('youtube.com/embed') ? url : null;

    if (embedUrl) {
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
    }

    return null;
  };

  return (
    <div className="view-lyrics-container">
      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <p><strong>Published Date:</strong> {lyric.published_date}</p>
          <pre>{lyric.lyrics}</pre>
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
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewLyrics;
