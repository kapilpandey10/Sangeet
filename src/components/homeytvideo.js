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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Function to fetch a random video from the database
  const fetchRandomVideo = async () => {
    setLoading(true);
    try {
      const { data: lyricsWithVideos, error } = await supabase
        .from('lyrics')
        .select('music_url')
        .not('music_url', 'is', null)
        .eq('status', 'approved');

      if (error) {
        throw new Error('Error fetching videos');
      }

      if (lyricsWithVideos && lyricsWithVideos.length > 0) {
        const randomLyric = lyricsWithVideos[Math.floor(Math.random() * lyricsWithVideos.length)];
        const selectedVideoUrl = randomLyric.music_url;

        localStorage.setItem('videoUrl', selectedVideoUrl); // Store the video URL
        localStorage.setItem('timestamp', new Date().getTime().toString()); // Store the current timestamp

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

  // Set interval to update the clock and change video every hour
  useEffect(() => {
    const storedVideo = localStorage.getItem('videoUrl');
    const storedTimestamp = localStorage.getItem('timestamp');
    const currentTime = new Date().getTime();
    const oneHour = 3600000; // 1 hour in milliseconds

    if (storedVideo && storedTimestamp) {
      const timeElapsed = currentTime - parseInt(storedTimestamp, 10);

      if (timeElapsed < oneHour) {
        setVideoUrl(storedVideo);
        setLoading(false);
      } else {
        // If an hour has passed, fetch a new video
        fetchRandomVideo();
      }
    } else {
      // If no video is stored, fetch a new video
      fetchRandomVideo();
    }

    // Set interval for the clock and video update every minute
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
      const newTimeElapsed = new Date().getTime() - parseInt(localStorage.getItem('timestamp'), 10);

      if (newTimeElapsed >= oneHour) {
        fetchRandomVideo(); // Fetch a new video if an hour has passed
      }
    }, 1000); // Update every second for the clock

    return () => clearInterval(clockInterval); // Clean up the interval when the component unmounts
  }, []);

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const renderYouTubeEmbed = () => {
    if (!videoUrl) return null;

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    // Customize the YouTube player parameters here
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
          allowFullScreen={false} // Disable fullscreen
        ></iframe>
      </div>
    );
  };

  // Function to render a digital clock with animated transitions
  const renderClock = () => {
    const hours = currentTime.getHours().toString().padStart(1, '0');
    const minutes = currentTime.getMinutes().toString().padStart(1, '0');
    const seconds = currentTime.getSeconds().toString().padStart(1, '0');

    return (
      <div className="digital-clock">
        <span className="digit">{hours}</span>:
        <span className="digit">{minutes}</span>:
        <span className="digit">{seconds}</span>
      </div>
    );
  };

  return (
    <div className="homeytvideo-container">
      <h2>Music for the Hours</h2> {/* Text added above the video */}
      {renderClock()} {/* Render the clock */}
      {loading ? (
        <p>Loading video...</p>
      ) : (
        renderYouTubeEmbed()
      )}
    </div>
  );
};

export default HomeYTVideo;
