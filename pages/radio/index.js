import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaGlobeAmericas, FaPlay, FaPause, FaBroadcastTower } from 'react-icons/fa';
import styles from './style/AppleRadio.module.css';

const RadioDiscovery = ({ initialStations }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userCountry, setUserCountry] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const audioRef = useRef(null);

  // 1. Intelligent Location Detection
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setUserCountry(data.country_name))
      .catch(() => setUserCountry("Australia")); // Default example
  }, []);

  // 2. Advanced Client-Side Search using provided parameters
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.length > 2) {
        setIsSearching(true);
        try {
          // Implementing search with your specific parameters: hidebroken, order, and limit
          const params = new URLSearchParams({
            name: search,
            hidebroken: 'true',
            order: 'clickcount',
            reverse: 'true',
            limit: '20'
          });
          const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params}`);
          const data = await res.json();
          setSearchResults(data.map(s => ({
            id: s.stationuuid,
            radioname: s.name,
            stream_url: s.url_resolved,
            logo_url: s.favicon,
            country: s.country,
            slug: s.stationuuid
          })));
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // 3. Audio Stream Controller
  const handlePlayStream = (e, station) => {
    e.preventDefault();
    e.stopPropagation();
    if (playingId === station.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      setPlayingId(station.id);
      audioRef.current.src = station.stream_url;
      audioRef.current.play().catch(err => console.error("Playback error", err));
    }
  };

  const displayStations = search.length > 2 ? searchResults : initialStations;

  return (
    <div className={styles.noirPage}>
      <Head><title>Radio Discovery | DynaBeat</title></Head>
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
              placeholder="Search stations, cities, or countries..." 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <main className={styles.mainGrid}>
        <section className={styles.shelf}>
          <h2 className={styles.shelfTitle}>
            {search.length > 2 ? `Results for "${search}"` : 'Global Discovery'}
          </h2>
          
          <div className={styles.bentoGrid}>
            {displayStations.map(s => (
              <div key={s.id} className={`${styles.compactCard} ${playingId === s.id ? styles.activeCard : ''}`}>
                <div className={styles.miniThumb}>
                  <img src={s.logo_url || '/logo/logo.webp'} alt="" />
                  <button className={styles.miniPlay} onClick={(e) => handlePlayStream(e, s)}>
                    {playingId === s.id ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
                <Link href={`/radio/${s.slug}`} className={styles.nameLink}>
                  <h4>{s.radioname}</h4>
                  <p>{s.country}</p>
                </Link>
                {playingId === s.id && (
                  <div className={styles.visualizer}>
                    <span></span><span></span><span></span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isSearching && <p className={styles.loadingText}>Fetching high-quality streams...</p>}
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    // Fetch top 50 global stations using your specific parameters
    const params = new URLSearchParams({
      hidebroken: 'true',
      order: 'votes',
      reverse: 'true',
      limit: '50'
    });
    
    const response = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params}`);
    const apiData = await response.json();

    const stations = apiData.map(s => ({
      id: s.stationuuid,
      radioname: s.name,
      stream_url: s.url_resolved,
      logo_url: s.favicon,
      country: s.country,
      slug: s.stationuuid
    }));

    return { props: { initialStations: stations } };
  } catch (error) {
    return { props: { initialStations: [] } };
  }
};

export default RadioDiscovery;