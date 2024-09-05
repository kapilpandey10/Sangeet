import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/HomeYTVideo.css'; // You can create this CSS file for styling

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomeYTVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [localTime, setLocalTime] = useState(new Date());

  // Fetch random video and update every hour
  useEffect(() => {
    const fetchRandomVideo = async () => {
      setLoading(true);
      const currentTime = new Date().getTime();
      const storedVideo = localStorage.getItem('videoUrl');
      const storedTimestamp = localStorage.getItem('timestamp');

      if (storedVideo && storedTimestamp) {
        const timeElapsed = currentTime - parseInt(storedTimestamp, 10);
        // Check if it's been less than an hour since the last change
        if (timeElapsed < 3600000) {
          setVideoUrl(storedVideo);
          setLoading(false);
          return;
        }
      }

      // Fetch a new video if no video or the hour has changed
      try {
        const { data: lyricsWithVideos, error } = await supabase
          .from('lyrics')
          .select('music_url')
          .not('music_url', 'is', null)
          .eq('status', 'approved');

        if (error) throw new Error('Error fetching videos');
        if (lyricsWithVideos && lyricsWithVideos.length > 0) {
          const randomLyric = lyricsWithVideos[Math.floor(Math.random() * lyricsWithVideos.length)];
          const selectedVideoUrl = randomLyric.music_url;
          localStorage.setItem('videoUrl', selectedVideoUrl);
          localStorage.setItem('timestamp', currentTime.toString());
          setVideoUrl(selectedVideoUrl);
        } else {
          throw new Error('No videos found');
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); // Fallback video
        setLoading(false);
      }
    };

    // Fetch video on component load
    fetchRandomVideo();

    // Update time every second
    const interval = setInterval(() => {
      const now = new Date();
      setLocalTime(now);

      // Check if it's the start of a new hour and fetch a new video
      if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        fetchRandomVideo();
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  // Extract YouTube ID from URL
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  // Render YouTube Embed
  const renderYouTubeEmbed = () => {
    if (!videoUrl) return null;

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=0&rel=0&controls=1&showinfo=1&autoplay=0&fs=0&mute=0`;

    return (
      <div className="youtube-video-section">
        <iframe
          width="100%"
          height="600"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
        ></iframe>
      </div>
    );
  };

  // Format time as HH:MM:SS AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  return (
    <div className="homeytvideo-container">
      <div className="header-section">
        <h2>Music for the Hours</h2>
        <p className="clock">{formatTime(localTime)}</p>
      </div>
      {loading ? (
        <p>Loading video...</p>
      ) : (
        renderYouTubeEmbed()
      )}
    </div>
  );
};

export default HomeYTVideo;
