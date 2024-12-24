import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Head from 'next/head';
import styles from './style/RadioPlayer.module.css';
import {
  FaPlay,
  FaPause,
  FaShareAlt,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner,
  FaSearch,
  FaRandom,  // Random icon import
} from 'react-icons/fa';

const RadioPlayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [radioStation, setRadioStation] = useState(null);
  const [suggestedStations, setSuggestedStations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [isPlaying, setIsPlaying] = useState(true); // Default to true for auto-play
  const [volume, setVolume] = useState(0.5);
  const [scanning, setScanning] = useState(false); // State to handle scanning effect
  const [isMuted, setIsMuted] = useState(false);
  const [noStationsMessage, setNoStationsMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  <Head>
  <title>{radioStation ? `${radioStation.radioname} - Listen Live` : 'Radio Player'} | Your Website Name</title>
  <meta
    name="description"
    content={
      radioStation
        ? `Listen to ${radioStation.radioname} broadcasting from ${radioStation.city}, ${radioStation.country}. Tune in for great music and shows!`
        : 'Enjoy our live radio player and explore various radio stations worldwide.'
    }
  />
  <meta name="keywords" content={radioStation ? `${radioStation.radioname}, ${radioStation.country} radio, live radio, online streaming` : 'live radio, online radio stations, music, streaming'} />
  <meta property="og:title" content={radioStation ? `${radioStation.radioname} - Live Stream` : 'Radio Player'} />
  <meta property="og:description" content={`Listen to ${radioStation ? radioStation.radioname : 'your favorite radio stations'} from ${radioStation ? `${radioStation.city}, ${radioStation.country}` : 'around the world'}.`} />
  <meta property="og:image" content={radioStation?.logo_url || 'default-image-url'} />
  <meta property="og:url" content={`https://pandeykapil.com.np/radio/${slug}`} />
  <meta property="og:type" content="website" />
</Head>

{/* Page content */}
<nav className={styles.breadcrumb}>
  <a href="/">Home</a> &gt; <a href="/radio">Radio</a> &gt; {radioStation?.radioname || 'Station'}
</nav>

  // Function to play audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Auto-play failed, user interaction needed:', err);
      });
    }
  };

 // Function to scan and play a random radio station from the selected country
const scanStationFromCountry = async () => {
  setScanning(true); // Start scanning animation
  setLoading(true);
  setNoStationsMessage(''); // Clear any previous error messages

  try {
    // Simulate scanning effect with a timeout before fetching the station
    setTimeout(async () => {
      // Fetch stations only from the selected country
      const { data, error } = await supabase
        .from('radio')
        .select('*')
        .eq('country', selectedCountry);

      if (!error && data.length > 0) {
        // Pick a random station from the fetched country data
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomStation = data[randomIndex];

        setRadioStation(randomStation);
        router.push(`/radio/${randomStation.slug}`);
        playAudio();
      } else {
        setNoStationsMessage('No stations available in this country.');
      }
      
      setScanning(false); // Stop scanning animation
    }, 2000); // Delay of 2 seconds for the scanning effect
  } catch (err) {
    console.error('Error fetching random station:', err);
    setNoStationsMessage('No stations available in this country.');
    setScanning(false); // Stop scanning animation
  } finally {
    setLoading(false);
  }
};

  // Fetch available countries for filtering
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase.from('radio').select('country');

        if (!error && data) {
          const uniqueCountries = [...new Set(data.map((item) => item.country))];
          setCountries(['All', ...uniqueCountries]);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  // Fetch the radio station data based on the slug
  useEffect(() => {
    const fetchRadioStation = async () => {
      if (!slug) {
        // If no slug is provided, fetch a random station from the selected country
        fetchRandomStation(selectedCountry);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.from('radio').select('*').eq('slug', slug).single();

        if (error || !data) {
          console.error('Error fetching radio station:', error || 'No data found');
        } else {
          setRadioStation(data);
          fetchSuggestedStations(data.city, slug, selectedCountry);
          autoPlayAudio();
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRadioStation();
  }, [slug, selectedCountry]);

  // Fetch random station from the selected country
  

  // Fetch suggested stations based on city and country
  const fetchSuggestedStations = async (city, excludeSlug, country) => {
    try {
      const query = supabase
        .from('radio')
        .select('slug, logo_url, radioname, frequency, city, country')
        .eq('city', city)
        .neq('slug', excludeSlug);

      const { data, error } = await query;

      // If no city-specific stations are available, get random stations from the country
      if (!error && data.length === 0) {
        const fallback = await supabase
          .from('radio')
          .select('slug, logo_url, radioname, frequency, city, country')
          .eq('country', country)
          .limit(10);

        if (!fallback.error && fallback.data) {
          setSuggestedStations(fallback.data);
        }
      } else {
        setSuggestedStations(data || []);
      }
    } catch (err) {
      console.error('Error fetching suggested stations:', err);
    }
  };

  // Auto-play audio on page load
  const autoPlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Auto-play failed, user interaction needed:', err);
        setIsPlaying(false);
      });
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Function to share the radio station
  const shareRadioStation = () => {
    if (navigator.share) {
      navigator
        .share({
          title: radioStation?.radioname || 'Radio Station',
          text: `Check out this radio station: ${radioStation?.radioname || 'Tune in to the best radio'}`,
          url: window.location.href,
        })
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  // Handle country selection
  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setSelectedCountry(newCountry);
    fetchRandomStation(newCountry);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newVolume = isMuted ? 0.5 : 0;
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
      setIsMuted(!isMuted);
    }
  };

  const playRandomStationFromCountry = async () => {
    setLoading(true);
    setNoStationsMessage(''); // Clear any previous error messages
  
    try {
      // Fetch all stations from the selected country
      const { data, error } = await supabase
      .from('radio')
      .select('*')
      .eq('country', selectedCountry)
      .order('random()') // This line shuffles the result server-side
      .limit(1); // Limit to 1 random station
    
  
      if (!error && data.length > 0) {
        // Pick a truly random station from the fetched data
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomStation = data[randomIndex];
        
        setRadioStation(randomStation);
        setFrequency(parseFloat(randomStation.frequency) || 100.0);
        router.push(`/radio/${randomStation.slug}`);
        playAudio();
      } else {
        setNoStationsMessage('No stations available in this country.');
      }
    } catch (err) {
      console.error('Error fetching random station:', err);
      setNoStationsMessage('No stations available in this country.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.radioPlayerContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb}>
        <a href="/">Home</a> &gt; <a href="/radio">Radio</a> &gt; {radioStation?.radioname || 'Station'}
      </nav>

      {/* Country Selector */}
      <div className={styles.countrySelector}>
        <label htmlFor="country">Choose a Country:</label>
        <select
          id="country"
          value={selectedCountry}
          onChange={handleCountryChange}
          className={styles.countryDropdown}
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className={styles.loadingSpinner}>
          <FaSpinner className={styles.spinnerIcon} spin />
        </div>
      )}

      {radioStation && !loading && (
        <>
          {/* Radio Station Header */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              {radioStation.logo_url ? (
                <img
                  src={radioStation.logo_url}
                  alt={`${radioStation.radioname} Logo`}
                  className={styles.stationLogo}
                />
              ) : (
                <div className={styles.fallbackLogo}>No Logo</div>
              )}
            </div>
            <div className={styles.stationDetails}>
              <h2 className={styles.stationName}>{radioStation.radioname}</h2>
              <p className={styles.stationFrequency}>
                {radioStation.frequency ? `${radioStation.frequency} MHz` : 'Online Only'}
              </p>
              <p className={styles.stationLocation}>
                {radioStation.city}, {radioStation.country}
              </p>
              <div className={styles.liveBadge}>Live</div>
            </div>
          </div>

          {/* Play/Pause, Random, Volume, and Share Controls */}
          <div className={styles.controlsContainer}>
            <button
              onClick={togglePlay}
              className={styles.playPauseButton}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
  onClick={scanStationFromCountry}
  className={`${styles.scanButton} ${scanning ? styles.scanning : ''}`}
  aria-label="Scan for Random Station in Country"
>
  <FaSearch /> {/* Scan Icon */}
</button>


              
            <div className={styles.volumeControl}>
              <button onClick={toggleMute} aria-label="Mute">
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                aria-label="Volume Control"
              />
            </div>
            <button
              onClick={shareRadioStation}
              className={styles.shareButton}
              aria-label="Share"
            >
              <FaShareAlt /> 
            </button>
            <audio ref={audioRef} src={radioStation?.stream_url} preload="metadata" autoPlay />
          </div>

          {/* Suggested Stations */}
          <div className={styles.suggestedStations}>
            <h3>Suggested Stations from {radioStation.city}</h3>
            <div className={styles.suggestionsList}>
              {suggestedStations.map((station) => (
                <div
                  key={station.slug}
                  className={styles.suggestionCard}
                  onClick={() => router.push(`/radio/${station.slug}`)}
                >
                  <img
                    src={station.logo_url}
                    alt={`${station.radioname} Logo`}
                    className={styles.suggestionLogo}
                  />
                  <div className={styles.suggestionInfo}>
                    <h4 className={styles.suggestionName}>{station.radioname}</h4>
                    <p className={styles.suggestionFrequency}>
                      {station.frequency ? `${station.frequency} MHz` : 'Online Only'}
                    </p>
                    <p className={styles.suggestionLocation}>
                      {station.city}, {station.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Message if no stations are found */}
      {noStationsMessage && (
        <div className={styles.noStationsMessage}>{noStationsMessage}</div>
      )}
    </div>
  );
};

export default RadioPlayer;

