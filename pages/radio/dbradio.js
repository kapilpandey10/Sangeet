import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';

const DBradio = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const playerRef = useRef(null);

  // Fetch YouTube URLs from the 'lyrics' table
  useEffect(() => {
    const fetchYouTubeUrls = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('music_url')
        .eq('status', 'approved'); // Adjust status or conditions as needed

      if (error) {
        console.error("Error fetching music URLs:", error);
      } else {
        // Filter out invalid URLs and set the videos state
        const videoUrls = data
          .map((item) => extractYouTubeId(item.music_url))
          .filter((id) => id); // Filter out any invalid IDs
        setVideos(videoUrls);
      }
    };

    fetchYouTubeUrls();
  }, []);

  // Function to extract the YouTube video ID from a URL
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  // Function to handle video end and play the next video
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src = `https://www.youtube.com/embed/${videos[currentVideoIndex]}?autoplay=1&mute=1&controls=0&enablejsapi=1`;
    }
  }, [currentVideoIndex, videos]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>DynaBeat Radio</h2>
      {videos.length > 0 ? (
        <iframe
          ref={playerRef}
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${videos[currentVideoIndex]}?autoplay=1&mute=1&controls=0&enablejsapi=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          onEnded={handleVideoEnd} // Listen for video end to play the next video
          style={{ display: 'none' }} // Hide the video player to create an audio-only experience
        ></iframe>
      ) : (
        <p>Loading radio stream...</p>
      )}
    </div>
  );
};

export default DBradio;
