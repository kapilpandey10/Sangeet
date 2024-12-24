import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient'; // Adjust the import based on your project structure
import styles from './style/Onscreen.module.css'; // Create a CSS module for styling

const Onscreen = () => {
  const [lyric, setLyric] = useState(null);
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  // Function to fetch a random lyric
  const fetchRandomLyric = async () => {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, title, slug, thumbnail_url,artist, lyrics_writer')
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching lyrics:', error);
      return;
    }

    if (data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setLyric(data[randomIndex]);
    }
  };
  const handleExploreNow = () => {
    setTimeout(() => {
      setVisible(false);
      router.push(`/lyrics/${lyric.slug}`);
    }, 1000); // Duration matches the CSS animation
  };

  useEffect(() => {
    // Fetch a random lyric on component mount
    fetchRandomLyric();

    // Set up interval to fetch a new lyric every minute
    const interval = setInterval(() => {
      fetchRandomLyric();
    }, 60000); // 60000 ms = 1 minute

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Determine if the component should be visible based on the current route
  useEffect(() => {
    const path = router.pathname;
    if (path === '/' || path.startsWith('/lyrics/')) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [router.pathname]);

  if (!lyric || !visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <button className={styles.closeButton} onClick={() => setVisible(false)}>
          &times;
        </button>
        <h3>Available now</h3><br></br>
        <img src={lyric.thumbnail_url} alt={lyric.title} className={styles.thumbnail} />
        <h3>{lyric.title}</h3>
        <h4>Artist: {lyric.artist}</h4>
        <p><h4>Lyrics :{lyric.lyrics_writer}</h4></p>
        <button className={styles.readNowButton} onClick={handleExploreNow}>
          Explore Now
        </button>
        
      </div>
    </div>
  );
};

export default Onscreen;
