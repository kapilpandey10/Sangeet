import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaMusic } from 'react-icons/fa';
import { Helmet } from 'react-helmet'; // Import React Helmet
import Verified from './verified';
import '../style/ViewLyrics.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
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
    return <p>Loading lyrics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="view-lyrics-container">
      <Helmet>
        <title>{lyric ? `${lyric.title} Lyrics - ${lyric.artist}` : 'Lyrics'}</title>
        <meta
          name="description"
          content={lyric ? `Read the lyrics of ${lyric.title} by ${lyric.artist}.` : 'Lyrics of popular songs.'}
        />
        <meta
          name="keywords"
          content={lyric ? `${lyric.title}, ${lyric.artist}, lyrics, song lyrics` : 'song lyrics, music, popular songs'}
        />
      </Helmet>

      {lyric ? (
        <>
          <h1>{lyric.title}</h1>
          <p><strong>Artist:</strong> {lyric.artist}</p>
          <pre className="lyrics-text">{lyric.lyrics}</pre>
          {lyric.music_url && renderYouTubeEmbed(lyric.music_url)}
        </>
      ) : (
        <p>Lyrics not found.</p>
      )}
    </div>
  );
};

export default ViewLyrics;
