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
  FaRandom,
  FaHeart,
  FaRegHeart,
  FaBroadcastTower,
  FaSignal,
  FaClock,
  FaMapMarkerAlt,
  FaGlobe,
  FaMusic,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';

const RadioPlayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [radioStation, setRadioStation] = useState(null);
  const [suggestedStations, setSuggestedStations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [scanning, setScanning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [noStationsMessage, setNoStationsMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [signalStrength, setSignalStrength] = useState(5);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [frequency, setFrequency] = useState(100.0);
  const audioRef = useRef(null);

  // Enhanced SEO Head component
  const renderSEOHead = () => (
    <Head>
      <title>
        {radioStation 
          ? `${radioStation.radioname} - Listen Live Radio from ${radioStation.city}, ${radioStation.country} | Your Radio Network`
          : 'Live Radio Player - Listen to World Radio Stations Online | Your Radio Network'
        }
      </title>
      <meta
        name="description"
        content={
          radioStation
            ? `Listen live to ${radioStation.radioname} radio station broadcasting from ${radioStation.city}, ${radioStation.country}. Enjoy ${radioStation.frequency ? `${radioStation.frequency} MHz` : 'online streaming'} with crystal clear sound quality. Tune in now for music, news, and entertainment.`
            : 'Discover and listen to live radio stations from around the world. Stream high-quality audio, explore local and international radio, and enjoy your favorite music, news, and talk shows online.'
        }
      />
      <meta 
        name="keywords" 
        content={radioStation 
          ? `${radioStation.radioname}, ${radioStation.city} radio, ${radioStation.country} radio stations, ${radioStation.frequency} MHz, live radio streaming, online radio, radio player, FM radio, AM radio, internet radio`
          : 'live radio, online radio stations, internet radio, FM radio, AM radio, world radio, music streaming, radio player, listen live, radio broadcast'
        } 
      />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={radioStation ? `🔴 LIVE: ${radioStation.radioname} - ${radioStation.city}` : '🔴 Live Radio Player'} />
      <meta property="og:description" content={radioStation ? `Now playing live from ${radioStation.city}, ${radioStation.country}. Listen to ${radioStation.radioname} with high-quality streaming.` : 'Listen to live radio stations from around the world'} />
      <meta property="og:image" content={radioStation?.logo_url || 'https://your-domain.com/default-radio-og.jpg'} />
      <meta property="og:url" content={`https://pandeykapil.com.np/radio/${slug || ''}`} />
      <meta property="og:site_name" content="Your Radio Network" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={radioStation ? `🔴 ${radioStation.radioname} Live` : '🔴 Live Radio'} />
      <meta name="twitter:description" content={radioStation ? `Listen live to ${radioStation.radioname} from ${radioStation.city}` : 'World radio stations at your fingertips'} />
      <meta name="twitter:image" content={radioStation?.logo_url || 'https://your-domain.com/default-radio-twitter.jpg'} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Your Radio Network" />
      <link rel="canonical" href={`https://pandeykapil.com.np/radio/${slug || ''}`} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": radioStation ? "RadioStation" : "WebSite",
          ...(radioStation ? {
            "name": radioStation.radioname,
            "url": `https://pandeykapil.com.np/radio/${slug}`,
            "logo": radioStation.logo_url,
            "description": `Live radio station ${radioStation.radioname} broadcasting from ${radioStation.city}, ${radioStation.country}`,
            "broadcastFrequency": radioStation.frequency ? `${radioStation.frequency} MHz` : null,
            "address": {
              "@type": "Place",
              "addressLocality": radioStation.city,
              "addressCountry": radioStation.country
            },
            "potentialAction": {
              "@type": "ListenAction",
              "target": `https://pandeykapil.com.np/radio/${slug}`
            }
          } : {
            "name": "Your Radio Network",
            "url": "https://pandeykapil.com.np/radio",
            "description": "Listen to live radio stations from around the world",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://pandeykapil.com.np/radio?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        })}
      </script>
      
      {/* Favicon and app icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://your-supabase-url.supabase.co" />
      {radioStation?.stream_url && (
        <link rel="preload" as="audio" href={radioStation.stream_url} />
      )}
    </Head>
  );

  // Update current time every second for realistic radio feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate signal strength based on connection quality
  useEffect(() => {
    const updateSignalStrength = () => {
      if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.effectiveType === '4g') setSignalStrength(5);
        else if (connection.effectiveType === '3g') setSignalStrength(4);
        else if (connection.effectiveType === '2g') setSignalStrength(2);
        else setSignalStrength(3);
      } else {
        // Random signal strength simulation
        setSignalStrength(Math.floor(Math.random() * 2) + 4);
      }
    };

    updateSignalStrength();
    const interval = setInterval(updateSignalStrength, 10000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsBuffering(true);
    const handleCanPlay = () => {
      setIsBuffering(false);
      setStreamError(false);
    };
    const handleError = () => {
      setStreamError(true);
      setIsBuffering(false);
      setIsPlaying(false);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
    };
  }, [radioStation]);

  // Play audio function
  const playAudio = async () => {
    if (audioRef.current && !streamError) {
      try {
        setIsBuffering(true);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Auto-play failed, user interaction needed:', err);
        setIsPlaying(false);
      } finally {
        setIsBuffering(false);
      }
    }
  };

  // Enhanced scan function with realistic radio scanning effect
  const scanStationFromCountry = async () => {
    setScanning(true);
    setLoading(true);
    setNoStationsMessage('');
    
    // Simulate realistic radio scanning
    const scanDuration = 3000;
    const steps = 20;
    const stepDuration = scanDuration / steps;
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        setFrequency(88.0 + (Math.random() * 20)); // FM range simulation
      }, i * stepDuration);
    }

    try {
      setTimeout(async () => {
        let query = supabase.from('radio').select('*');
        
        if (selectedCountry !== 'All') {
          query = query.eq('country', selectedCountry);
        }
        
        const { data, error } = await query;

        if (!error && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          const randomStation = data[randomIndex];

          setRadioStation(randomStation);
          setFrequency(parseFloat(randomStation.frequency) || 100.0);
          router.push(`/radio/${randomStation.slug}`);
          await playAudio();
        } else {
          setNoStationsMessage(`No stations available ${selectedCountry !== 'All' ? 'in ' + selectedCountry : ''}.`);
        }
        
        setScanning(false);
        setLoading(false);
      }, scanDuration);
    } catch (err) {
      console.error('Error fetching random station:', err);
      setNoStationsMessage('Error occurred while scanning for stations.');
      setScanning(false);
      setLoading(false);
    }
  };

  // Fetch available countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('radio')
          .select('country')
          .order('country');

        if (!error && data) {
          const uniqueCountries = [...new Set(data.map((item) => item.country))].sort();
          setCountries(['All', ...uniqueCountries]);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  // Fetch radio station data
  useEffect(() => {
    const fetchRadioStation = async () => {
      if (!slug) {
        fetchRandomStation();
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('radio')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.error('Error fetching radio station:', error || 'No data found');
          setNoStationsMessage('Station not found');
        } else {
          setRadioStation(data);
          setFrequency(parseFloat(data.frequency) || 100.0);
          fetchSuggestedStations(data.city, slug, data.country);
          // Don't auto-play, let user interact first
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setNoStationsMessage('Error loading station');
      } finally {
        setLoading(false);
      }
    };

    fetchRadioStation();
  }, [slug]);

  // Fetch random station
  const fetchRandomStation = async () => {
    setLoading(true);
    try {
      let query = supabase.from('radio').select('*');
      
      if (selectedCountry !== 'All') {
        query = query.eq('country', selectedCountry);
      }
      
      const { data, error } = await query.limit(50);

      if (!error && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomStation = data[randomIndex];
        
        setRadioStation(randomStation);
        setFrequency(parseFloat(randomStation.frequency) || 100.0);
        router.push(`/radio/${randomStation.slug}`);
      }
    } catch (err) {
      console.error('Error fetching random station:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggested stations
  const fetchSuggestedStations = async (city, excludeSlug, country) => {
    try {
      const { data, error } = await supabase
        .from('radio')
        .select('slug, logo_url, radioname, frequency, city, country')
        .eq('city', city)
        .neq('slug', excludeSlug)
        .limit(8);

      if (!error && data.length === 0) {
        const fallback = await supabase
          .from('radio')
          .select('slug, logo_url, radioname, frequency, city, country')
          .eq('country', country)
          .neq('slug', excludeSlug)
          .limit(8);

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

  // Toggle play/pause
  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await playAudio();
      }
    }
  };

  // Share functionality
  const shareRadioStation = () => {
    setShareModalOpen(true);
  };

  const shareToSocial = (platform) => {
    const url = window.location.href;
    const text = `🔴 Listen to ${radioStation?.radioname || 'this radio station'} live from ${radioStation?.city}, ${radioStation?.country}!`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShareModalOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle country change
  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setSelectedCountry(newCountry);
  };

  // Volume controls
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
      const newVolume = isMuted ? 0.7 : 0;
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
      setIsMuted(!isMuted);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // Here you could save to localStorage or database
  };

  return (
    <>
      {renderSEOHead()}
      <div className={styles.radioPlayerContainer}>
        {/* Enhanced Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb navigation">
          <a href="/" aria-label="Home">🏠 Home</a>
          <span className={styles.separator}>›</span>
          <a href="/radio" aria-label="Radio stations">📻 Radio</a>
          <span className={styles.separator}>›</span>
          <span className={styles.currentPage}>
            {radioStation?.radioname || 'Loading...'}
          </span>
        </nav>

        {/* Real-time status bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              LIVE
            </span>
            <span className={styles.currentTime}>
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <div className={styles.statusRight}>
            <div className={styles.signalStrength}>
              <FaSignal />
              <div className={styles.signalBars}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.signalBar} ${
                      i < signalStrength ? styles.active : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            {isBuffering && <FaSpinner className={styles.bufferingIcon} />}
          </div>
        </div>

        {/* Country Selector with enhanced styling */}
        <div className={styles.countrySelector}>
          <FaGlobe className={styles.globeIcon} />
          <label htmlFor="country">Browse by Country:</label>
          <select
            id="country"
            value={selectedCountry}
            onChange={handleCountryChange}
            className={styles.countryDropdown}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country === 'All' ? '🌍 All Countries' : `${country}`}
              </option>
            ))}
          </select>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.radioAnimation}>
              <div className={styles.radioWaves}>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
              </div>
              <FaBroadcastTower className={styles.towerIcon} />
            </div>
            <p className={styles.loadingText}>
              {scanning ? 'Scanning frequencies...' : 'Tuning in...'}
            </p>
            {scanning && (
              <div className={styles.frequencyDisplay}>
                <span>{frequency.toFixed(1)} MHz</span>
              </div>
            )}
          </div>
        )}

        {/* Main Radio Player */}
        {radioStation && !loading && (
          <div className={styles.radioPlayer}>
            {/* Station Header with Enhanced Design */}
            <div className={styles.stationHeader}>
              <div className={styles.stationVisual}>
                <div className={styles.logoContainer}>
                  {radioStation.logo_url ? (
                    <img
                      src={radioStation.logo_url}
                      alt={`${radioStation.radioname} Logo`}
                      className={styles.stationLogo}
                    />
                  ) : (
                    <div className={styles.fallbackLogo}>
                      <FaMusic />
                    </div>
                  )}
                  {isPlaying && (
                    <div className={styles.playingAnimation}>
                      <div className={styles.equalizer}>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.frequencyTuner}>
                  <div className={styles.tunerDisplay}>
                    <span className={styles.frequency}>
                      {radioStation.frequency ? `${radioStation.frequency}` : '88.5'} MHz
                    </span>
                    <div className={styles.tunerLine}></div>
                  </div>
                </div>
              </div>

              <div className={styles.stationInfo}>
                <h1 className={styles.stationName}>{radioStation.radioname}</h1>
                <div className={styles.locationInfo}>
                  <FaMapMarkerAlt />
                  <span>{radioStation.city}, {radioStation.country}</span>
                </div>
                
                <div className={styles.stationMeta}>
                  {streamError ? (
                    <span className={styles.errorBadge}>Stream Unavailable</span>
                  ) : isPlaying ? (
                    <span className={styles.onAirBadge}>🔴 ON AIR</span>
                  ) : (
                    <span className={styles.readyBadge}>Ready to Play</span>
                  )}
                </div>
              </div>

              <button
                onClick={toggleLike}
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                aria-label={isLiked ? 'Unlike station' : 'Like station'}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            {/* Enhanced Controls */}
            <div className={styles.controlsContainer}>
              <div className={styles.mainControls}>
                <button
                  onClick={scanStationFromCountry}
                  className={`${styles.scanButton} ${scanning ? styles.scanning : ''}`}
                  aria-label="Scan for random station"
                  disabled={scanning}
                >
                  <FaRandom />
                  <span>Scan</span>
                </button>

                <button
                  onClick={togglePlay}
                  className={styles.playPauseButton}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  disabled={streamError}
                >
                  {isBuffering ? (
                    <FaSpinner className={styles.spinner} />
                  ) : isPlaying ? (
                    <FaPause />
                  ) : (
                    <FaPlay />
                  )}
                </button>

                <button
                  onClick={shareRadioStation}
                  className={styles.shareButton}
                  aria-label="Share station"
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>
              </div>

              <div className={styles.volumeSection}>
                <button 
                  onClick={toggleMute} 
                  className={styles.muteButton}
                  aria-label="Toggle mute"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <div className={styles.volumeSliderContainer}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeSlider}
                    aria-label="Volume control"
                  />
                  <span className={styles.volumeValue}>{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Audio Element */}
            <audio 
              ref={audioRef} 
              src={radioStation?.stream_url} 
              preload="metadata"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Enhanced Suggested Stations */}
        {suggestedStations.length > 0 && (
          <div className={styles.suggestedSection}>
            <h2 className={styles.sectionTitle}>
              <FaBroadcastTower />
              More from {radioStation?.city || 'this region'}
            </h2>
            <div className={styles.stationGrid}>
              {suggestedStations.map((station) => (
                <div
                  key={station.slug}
                  className={styles.stationCard}
                  onClick={() => router.push(`/radio/${station.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(`/radio/${station.slug}`);
                    }
                  }}
                >
                  <div className={styles.cardImageContainer}>
                    {station.logo_url ? (
                      <img
                        src={station.logo_url}
                        alt={`${station.radioname} Logo`}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.cardImageFallback}>
                        <FaMusic />
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{station.radioname}</h3>
                    <p className={styles.cardFrequency}>
                      {station.frequency ? `${station.frequency} MHz` : 'Online'}
                    </p>
                    <p className={styles.cardLocation}>
                      {station.city}, {station.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Modal */}
        {shareModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setShareModalOpen(false)}>
            <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
              <h3>Share this station</h3>
              <div className={styles.shareButtons}>
                <button onClick={() => shareToSocial('facebook')} className={styles.facebookShare}>
                  <FaFacebook /> Facebook
                </button>
                <button onClick={() => shareToSocial('twitter')} className={styles.twitterShare}>
                  <FaTwitter /> Twitter
                </button>
                <button onClick={() => shareToSocial('whatsapp')} className={styles.whatsappShare}>
                  <FaWhatsapp /> WhatsApp
                </button>
                <button onClick={() => shareToSocial('telegram')} className={styles.telegramShare}>
                  <FaTelegram /> Telegram
                </button>
              </div>
              <div className={styles.copySection}>
                <button onClick={copyToClipboard} className={styles.copyButton}>
                  {copySuccess ? <FaCheck /> : <FaCopy />}
                  {copySuccess ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <button 
                onClick={() => setShareModalOpen(false)}
                className={styles.closeModal}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error/No stations message */}
        {noStationsMessage && (
          <div className={styles.messageContainer}>
            <div className={styles.noStationsMessage}>
              <FaBroadcastTower />
              <p>{noStationsMessage}</p>
              <button onClick={fetchRandomStation} className={styles.retryButton}>
                Try Another Station
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RadioPlayer;
