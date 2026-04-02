import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import { FaTimes, FaMusic, FaArrowRight } from 'react-icons/fa';
import styles from './style/Onscreen.module.css';

const AUTO_DISMISS_MS = 5000;

const Onscreen = () => {
  const [lyric, setLyric]       = useState(null);
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100);
  const router = useRouter();

  const fetchRandomLyric = async () => {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, title, slug, thumbnail_url, artist, lyrics_writer')
      .eq('status', 'approved');

    if (!error && data?.length > 0) {
      setLyric(data[Math.floor(Math.random() * data.length)]);
    }
  };

  const handleExploreNow = () => {
    setVisible(false);
    router.push(`/viewlyrics/${lyric.slug}`);
  };

  useEffect(() => {
    fetchRandomLyric();
  }, []);

  // Show only on homepage
  useEffect(() => {
    if (router.pathname !== '/') { setVisible(false); return; }
    const show = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(show);
  }, [router.pathname]);

  // Auto-dismiss + progress bar
  useEffect(() => {
    if (!visible) { setProgress(100); return; }

    // Shrink progress bar smoothly
    const interval = 50; // ms per tick
    const step = (interval / AUTO_DISMISS_MS) * 100;
    const ticker = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) { clearInterval(ticker); return 0; }
        return prev - step;
      });
    }, interval);

    // Dismiss after 5s
    const dismiss = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);

    return () => { clearInterval(ticker); clearTimeout(dismiss); };
  }, [visible]);

  if (!lyric || !visible) return null;

  return (
    <div className={styles.overlayContainer}>
      <div className={styles.glassBanner}>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <button className={styles.closeBtn} onClick={() => setVisible(false)} aria-label="Close">
          <FaTimes />
        </button>

        <div className={styles.contentLayout}>
          <div className={styles.imageBox}>
            <img src={lyric.thumbnail_url || '/logo/logo.webp'} alt={lyric.title} />
          </div>

          <div className={styles.textDetails}>
            <div className={styles.categoryLabel}><FaMusic /> Featured</div>
            <h3 className={styles.songTitle}>{lyric.title}</h3>
            <p className={styles.artistName}>{lyric.artist}</p>
          </div>
        </div>

        <button className={styles.actionBtn} onClick={handleExploreNow}>
          View Lyrics <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Onscreen;