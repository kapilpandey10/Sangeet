import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // To handle navigation
import '../style/HomeYTVideo.css'; // You can create this CSS file for styling

const HomeYTVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lyricsData, setLyricsData] = useState(null); // Store the title, artist, and slug
  const navigate = useNavigate(); // React Router hook to handle navigation

  // Function to fetch a video based on the current 5-minute interval
  const fetchVideoForInterval = async () => {
    setLoading(true);
    try {
      // Fetch the list of approved videos with a non-null `music_url`
      const { data: lyricsWithVideos, error } = await supabase
        .from('lyrics')
        .select('title, artist, music_url, slug') // Fetch the title, artist, and slug
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
        const selectedVideoData = lyricsWithVideos[intervalIndex];

        setVideoUrl(selectedVideoData.music_url);
        setLyricsData(selectedVideoData); // Set the title, artist, and slug data
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

  // Countdown Timer Logic
  const calculateTimeLeft = () => {
    const currentUTCMinutes = new Date().getUTCMinutes();
    const currentUTCSeconds = new Date().getUTCSeconds();
    const timeElapsed = (currentUTCMinutes % 5) * 60 + currentUTCSeconds; // Time elapsed in seconds within the 5-minute interval
    const timeRemaining = 5 * 60 - timeElapsed; // 5 minutes in seconds
    return timeRemaining;
  };

  // Update the countdown timer every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerInterval); // Clean up the timer interval
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

  // Calculate the remaining minutes and seconds for the countdown
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  // Handle the navigation to the lyrics page using the `slug` from the database
  const handleViewLyricsClick = () => {
    if (lyricsData) {
      const { slug } = lyricsData;
      navigate(`/lyrics/${slug}`); // Use the slug directly for navigation
    }
  };

  return (
    <div className="homeytvideo-container">
      <h2>New Song in {minutesLeft}:{secondsLeft.toString().padStart(2, '0')} Minutes. Stay Tuned!</h2> {/* Countdown timer displayed */}
      {loading ? (
        <p>Loading Youtube video...</p>
      ) : (
        <>
          {renderYouTubeEmbed()}
          <button 
            className="view-lyrics-button"
            onClick={handleViewLyricsClick} // Navigate to the lyrics page
          >
            View Lyrics
          </button>
        </>
      )}
    </div>
  );
};

export default HomeYTVideo;
