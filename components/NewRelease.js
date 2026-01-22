import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { FaPlay, FaChevronLeft, FaChevronRight, FaTimes, FaLayerGroup } from 'react-icons/fa';
import styles from './style/NewRelease.module.css';

const NewRelease = () => {
  const [releases, setReleases] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const scrollRef = useRef(null);

  // Fetch exactly like your Admin logic
  useEffect(() => {
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('id, title, artist, thumbnail_url, music_url')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error) setReleases(data);
    };
    fetchLatest();
  }, []);

  // 5-Second Auto-Scroll
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current && !activeVideo) {
        const { scrollLeft, offsetWidth, scrollWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + offsetWidth >= scrollWidth - 10;
        scrollRef.current.scrollTo({ 
          left: isAtEnd ? 0 : scrollLeft + 320, 
          behavior: 'smooth' 
        });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [activeVideo]);

  const extractYTId = (url) => url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  return (
    <section className={styles.noirSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <FaLayerGroup className={styles.brandIcon} />
            <h2>New <span>Releases</span></h2>
          </div>
          <div className={styles.navBtns}>
            <button onClick={() => scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' })}><FaChevronLeft /></button>
            <button onClick={() => scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })}><FaChevronRight /></button>
          </div>
        </div>

        <div className={styles.viewport} ref={scrollRef}>
          {releases.map((item) => (
            <div key={item.id} className={styles.noirCard} onClick={() => setActiveVideo(extractYTId(item.music_url))}>
              <div className={styles.imageBox}>
                <img src={item.thumbnail_url || '/logo/logo.webp'} alt="" />
                <div className={styles.playOverlay}><FaPlay /></div>
              </div>
              <div className={styles.cardMeta}>
                <h4>{item.title}</h4>
                <p>{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Obsidian Video Player */}
      {activeVideo && (
        <div className={styles.modal} onClick={() => setActiveVideo(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setActiveVideo(null)}><FaTimes /></button>
            <div className={styles.videoWrapper}>
              <iframe 
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`} 
                allow="autoplay; encrypted-media" 
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NewRelease;