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

  // Function to fetch a video based on the current 5-minute interval
  const fetchVideoForInterval = async () => {
    setLoading(true);
    try {
      // Fetch the list of approved videos with a non-null `music_url`
      const { data: lyricsWithVideos, error } = await supabase
        .from('lyrics')
        .select('music_url')
        .not('music_url', 'is', null)
        .eq('status', 'approved');

      if (error) {
        throw new Error('Error fetching videos');
      }

      if (lyricsWithVideos && lyricsWithVideos.length > 0) {
        // Calculate the 5-minute interval (current minutes divided by 5)
        const currentUTCMinutes = new Date().getUTCMinutes();
        const intervalIndex = Math.floor(currentUTCMinutes / 5) % lyricsWithVideos.length; // Cycle through available videos

        // Select the video based on the calculated interval
        const selectedVideoUrl = lyricsWithVideos[intervalIndex].music_url;
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

  // Set up the interval to update the video every 5 minutes and synchronize across all devices
  useEffect(() => {
    fetchVideoForInterval(); // Fetch video immediately when component loads

    // Set interval to check and update video every 5 minutes
    const videoUpdateInterval = setInterval(() => {
      fetchVideoForInterval();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(videoUpdateInterval); // Clean up interval when the component unmounts
  }, []);

  // Extract the YouTube video ID from the URL
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  // Render the YouTube embed
  const renderYouTubeEmbed = () => {
    if (!videoUrl) return null;

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0&autoplay=1&mute=0`;

    return (
      <div className="youtube-video-section">
        <iframe
          width="100%"
          height="600"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  // Render a digital clock to show current time (optional)
  const renderClock = () => {
    const hours = currentTime.getUTCHours().toString().padStart(2, '0');
    const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getUTCSeconds().toString().padStart(2, '0');

    return (
      <div className="digital-clock">
        <span className="digit">{hours}</span>:
        <span className="digit">{minutes}</span>:
        <span className="digit">{seconds}</span> UTC
      </div>
    );
  };

  // Update the current time every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval); // Clean up interval
  }, []);

  return (
    <div className="homeytvideo-container">
      <h2>Changing Vibes Every 5 Minutes</h2> {/* Heading added above the video */}
      {renderClock()} {/* Render the clock */}
      {loading ? (
        <p>Loading Youtube video...</p>
      ) : (
        renderYouTubeEmbed()
      )}
    </div>
  );
};

export default HomeYTVideo;
