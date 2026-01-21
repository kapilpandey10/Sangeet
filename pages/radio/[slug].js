import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import { 
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, 
  FaSearch, FaBroadcastTower, FaChevronLeft, FaExclamationTriangle 
} from 'react-icons/fa';
import styles from './style/ApplePlayer.module.css';

const RadioStudioPlayer = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [station, setStation] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isOffline, setIsOffline] = useState(false);
  const [metadata, setMetadata] = useState({ now: 'Connecting...' });
  const audioRef = useRef(null);

  // 1. Fetch Station Data
  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const { data: current } = await supabase.from('radio').select('*').eq('slug', slug).single();
      const { data: list } = await supabase.from('radio').select('*').eq('status', 'online');
      if (current) setStation(current);
      if (list) setAllStations(list);
    };
    fetchData();
  }, [slug]);

  // 2. Auto-play Logic
  useEffect(() => {
    if (station && audioRef.current) {
      // Small delay to ensure the stream URL is loaded into the audio element
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Autoplay blocked by browser. User interaction required.");
            setIsPlaying(false);
          });
      }
    }
  }, [station]);

  // 3. Metadata Fetching
  useEffect(() => {
    if (!slug) return;
    const getMeta = async () => {
      try {
        const res = await fetch(`/api/metadata?slug=${slug}`);
        const data = await res.json();
        setIsOffline(data.isOffline);
        setMetadata({ now: data.now || 'Live Broadcast' });
      } catch (e) {
        setIsOffline(true);
      }
    };
    getMeta();
    const interval = setInterval(getMeta, 25000);
    return () => clearInterval(interval);
  }, [slug]);

  const togglePlayback = () => {
    if (isOffline) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const filteredStations = allStations.filter(s => 
    s.radioname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.studioContainer}>
      <Head>
        <title>{station?.radioname || 'Radio'} | DynaBeat</title>
      </Head>

      <div className={styles.ambientBg} style={{ backgroundImage: `url(${station?.logo_url || '/logo/logo.webp'})` }}></div>
      <div className={styles.glassOverlay}></div>

      <div className={styles.studioLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button onClick={() => router.push('/radio')} className={styles.backBtn}>
              <FaChevronLeft /> All Stations
            </button>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search station..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.stationList}>
            {filteredStations.map(s => (
              <Link href={`/radio/${s.slug}`} key={s.slug} className={`${styles.sideCard} ${s.slug === slug ? styles.activeCard : ''}`}>
                <img src={s.logo_url || '/logo/logo.webp'} alt={s.radioname} />
                <div className={styles.sideCardInfo}>
                  <h4>{s.radioname}</h4>
                  <p>{s.frequency} MHz</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <main className={styles.playerMain}>
          <div className={`${styles.statusBadge} ${isOffline ? styles.offlineBadge : ''}`}>
            {isOffline ? <><FaExclamationTriangle /> OFFLINE</> : <><FaBroadcastTower /> ON AIR</>}
          </div>

          <div className={styles.artworkSection}>
            <div className={`${styles.artworkRing} ${isPlaying ? styles.spinRing : ''}`}>
              <img src={station?.logo_url || '/logo/logo.webp'} alt="Artwork" className={styles.mainArtwork} />
            </div>
          </div>

          <div className={styles.trackDetails}>
            <span className={styles.currentlyLabel}>
              {isOffline ? 'STATION STATUS' : 'CURRENTLY PLAYING'}
            </span>
            <h1 className={styles.songTitle}>
              {isOffline ? 'Station is currently offline' : metadata.now}
            </h1>
            <h2 className={styles.stationName}>{station?.radioname} • {station?.city}</h2>
          </div>

          <div className={styles.studioControls}>
            <button onClick={togglePlayback} className={`${styles.masterPlayBtn} ${isOffline ? styles.disabledBtn : ''}`}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div className={styles.volumeDialContainer}>
              <div className={styles.dialLabel}>
                {volume == 0 ? <FaVolumeMute /> : <FaVolumeUp />} {Math.round(volume * 100)}%
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={volume} 
                className={styles.realVolumeSlider}
                onChange={(e) => {
                  setVolume(e.target.value);
                  if(audioRef.current) audioRef.current.volume = e.target.value;
                }} 
              />
            </div>
          </div>
        </main>
      </div>

      <audio 
        ref={audioRef} 
        src={station?.stream_url} 
        crossOrigin="anonymous" 
        autoPlay={true} // Extra hint for the browser
      />
    </div>
  );
};

export default RadioStudioPlayer;