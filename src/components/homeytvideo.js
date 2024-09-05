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

  useEffect(() => {
    const fetchRandomVideo = async () => {
      setLoading(true);
      const storedVideo = localStorage.getItem('videoUrl');
      const storedTimestamp = localStorage.getItem('timestamp');
      const currentTime = new Date().getTime();
  
      if (storedVideo && storedTimestamp) {
        const timeElapsed = currentTime - parseInt(storedTimestamp, 10);
        if (timeElapsed < 3600000) {
          setVideoUrl(storedVideo);
          setLoading(false);
          return;
        }
      }
  
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
          localStorage.setItem('videoUrl', selectedVideoUrl);
          localStorage.setItem('timestamp', currentTime.toString());
          setVideoUrl(selectedVideoUrl);
        } else {
          throw new Error('No videos found');
        }
  
        setLoading(false);
      } catch (err) {
        console.error(err);
        // Set a fallback video URL if no video is found or there's an error
        setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); // Fallback video
        setLoading(false);
      }
    };
  
    fetchRandomVideo();
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
  
  return (
    <div className="homeytvideo-container">
      <h2>Music for the Hours</h2> {/* Text added above the video */}
      {loading ? (
        <p>Loading video...</p>
      ) : (
        renderYouTubeEmbed()
      )}
    </div>
  );
};

export default HomeYTVideo;
