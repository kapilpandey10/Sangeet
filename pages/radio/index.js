import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaGlobeAmericas, FaPlay, FaPause, FaBroadcastTower } from 'react-icons/fa';
import styles from './style/AppleRadio.module.css';

const RadioDiscovery = ({ stations }) => {
  const [search, setSearch] = useState('');
  const [userCountry, setUserCountry] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  // 1. Detect Location & Prioritize
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setUserCountry(data.country_name))
      .catch(() => setUserCountry("Nepal"));
  }, []);

  // 2. Smart Sorting: Local First, then alphabetically
  const sortedStations = useMemo(() => {
    return [...stations].sort((a, b) => {
      if (a.country === userCountry && b.country !== userCountry) return -1;
      if (b.country === userCountry && a.country !== userCountry) return 1;
      return a.radioname.localeCompare(b.radioname);
    });
  }, [stations, userCountry]);

  // 3. Audio Stream Handler
  const handlePlayStream = (e, station) => {
    e.stopPropagation(); // Prevents navigation when clicking play icon
    if (playingId === station.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      setPlayingId(station.id);
      audioRef.current.src = station.stream_url;
      audioRef.current.play();
    }
  };

  const filtered = sortedStations.filter(s => 
    s.radioname.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.noirPage}>
      <Head><title>Radio Discovery | DynaBeat</title></Head>
      
      {/* Hidden Audio Engine */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <header className={styles.topHeader}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <h1>Radio<span>Discovery</span></h1>
            {userCountry && <p className={styles.location}><FaGlobeAmericas /> Local in {userCountry}</p>}
          </div>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search stations or countries..." 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <main className={styles.mainGrid}>
        {/* Local Priority Spotlight */}
        {!search && userCountry && (
          <section className={styles.shelf}>
            <h2 className={styles.shelfTitle}>Stations Near You</h2>
            <div className={styles.heroScroll}>
              {stations.filter(s => s.country === userCountry).map(s => (
                <HeroStation 
                  key={s.id} 
                  station={s} 
                  isPlaying={playingId === s.id} 
                  onPlay={(e) => handlePlayStream(e, s)} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Discovery Feed */}
        <section className={styles.shelf}>
          <h2 className={styles.shelfTitle}>{search ? 'Search Results' : 'Global Discovery'}</h2>
          <div className={styles.bentoGrid}>
            {filtered.slice(0, 12).map(s => (
              <CompactStation 
                key={s.id} 
                station={s} 
                isPlaying={playingId === s.id} 
                onPlay={(e) => handlePlayStream(e, s)} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// Sub-component for Major Stations
const HeroStation = ({ station, isPlaying, onPlay }) => (
  <div className={styles.heroCard}>
    <div className={styles.cardVisual}>
      <img src={station.logo_url || '/logo/logo.webp'} alt="" />
      <button className={styles.playOverlay} onClick={onPlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </div>
    <div className={styles.cardDetails}>
      <Link href={`/radio/${station.slug}`}>
        <h3 className={styles.stationLink}>{station.radioname}</h3>
      </Link>
      <p>{station.city || station.country}</p>
    </div>
  </div>
);

// Sub-component for Grid Display
const CompactStation = ({ station, isPlaying, onPlay }) => (
  <div className={`${styles.compactCard} ${isPlaying ? styles.activeCard : ''}`}>
    <div className={styles.miniThumb}>
      <img src={station.logo_url || '/logo/logo.webp'} alt="" />
      <button className={styles.miniPlay} onClick={onPlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </div>
    <Link href={`/radio/${station.slug}`} className={styles.nameLink}>
      <h4>{station.radioname}</h4>
      <p>{station.country}</p>
    </Link>
  </div>
);

export const getServerSideProps = async () => {
  const { data } = await supabase.from('radio').select('*').eq('status', 'online');
  return { props: { stations: data || [] } };
};

export default RadioDiscovery;