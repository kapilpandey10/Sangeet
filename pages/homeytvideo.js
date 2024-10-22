import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Import from the centralized supabaseClient file
import { useRouter } from 'next/router'; // Next.js router for navigation
import styles from '../styles/HomeYTVideo.module.css'; // Correct CSS module import

const HomeYTVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lyricsData, setLyricsData] = useState(null); // Store the title, artist, and slug
  const router = useRouter(); // Next.js useRouter hook for navigation

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
      <div className={styles.youtubeVideoContainer}>
        <div className={styles.videoWrapper}>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {/* Add logo overlay and text */}
        <div className={styles.logoContainer}>
          <img
            src="../logo/logo.webp"
            alt="Logo"
            className={styles.logoOverlay} // Apply the logo CSS
          />
          <p>
            <span className={styles.brandName}>
              Dyna<span className={styles.highlight}>Beat</span>
            </span>
          </p>
        </div>
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
      router.push(`/lyrics/${slug}`); // Navigate using Next.js router
    }
  };

  return (
    <div className={styles.homeYTVideoContainer}>
      <h2 className={styles.timerText}>
        New Song in {minutesLeft}:{secondsLeft.toString().padStart(2, '0')} Minutes. Stay Tuned!
      </h2>
      {loading ? (
        <p>Loading YouTube video...</p>
      ) : (
        <>
          {renderYouTubeEmbed()}
          <button 
            className={styles.viewLyricsButton}
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
