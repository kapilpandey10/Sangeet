import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import { FaTimes, FaMusic, FaArrowRight, FaClock } from 'react-icons/fa';
import styles from './style/Onscreen.module.css';

const Onscreen = () => {
  const [lyric, setLyric] = useState(null);
  const [visible, setVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();

  // 1. Fetch random lyric
  const fetchRandomLyric = async () => {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, title, slug, thumbnail_url, artist, lyrics_writer')
      .eq('status', 'approved');

    if (!error && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setLyric(data[randomIndex]);
    }
  };

  // 2. Navigation logic
  const handleExploreNow = () => {
    setVisible(false);
    router.push(`/viewlyrics/${lyric.slug}`);
  };

  useEffect(() => {
    fetchRandomLyric();
    
    // Live clock for the "Advanced" feel
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Visibility logic (Homepage only)
  useEffect(() => {
    if (router.pathname === '/') {
      const timer = setTimeout(() => setVisible(true), 1500); // Slight delay for better UX
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [router.pathname]);

  if (!lyric || !visible) return null;

  return (
    <div className={styles.overlayContainer}>
      <div className={styles.glassBanner}>
        <button className={styles.closeBtn} onClick={() => setVisible(false)}>
          <FaTimes />
        </button>

        <div className={styles.badgeRow}>
          <span className={styles.liveBadge}>LIVE NOW</span>
          <span className={styles.timeBadge}><FaClock /> {currentTime}</span>
        </div>

        <div className={styles.contentLayout}>
          <div className={styles.imageBox}>
            <img src={lyric.thumbnail_url || '/logo/logo.webp'} alt={lyric.title} />
          </div>
          
          <div className={styles.textDetails}>
            <div className={styles.categoryLabel}><FaMusic /> Featured Lyrics</div>
            <h3 className={styles.songTitle}>{lyric.title}</h3>
            <p className={styles.artistName}>by {lyric.artist}</p>
            <p className={styles.writerName}>Written by: {lyric.lyrics_writer || 'DynaBeat Team'}</p>
          </div>
        </div>

        <button className={styles.actionBtn} onClick={handleExploreNow}>
          Explore Now <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Onscreen;