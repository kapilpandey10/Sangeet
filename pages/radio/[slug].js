import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import styles from './style/RadioPlayer.module.css';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaBackward, FaForward, FaShareAlt } from 'react-icons/fa';

const RadioPlayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [radioStation, setRadioStation] = useState(null);
  const [suggestedStations, setSuggestedStations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [localTime, setLocalTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const audioRef = useRef(null);

  // Fetch the radio station data based on the slug from Supabase
  const fetchRadioStation = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching radio station:', error || 'No data found');
        setErrorMessage('Could not load the radio station. Please try again.');
        setLoading(false);
        return;
      }

      setRadioStation(data);
      setErrorMessage('');

      const { data: suggestions, error: suggestionsError } = await supabase
        .from('radio')
        .select('slug, logo_url, radioname, frequency, city')
        .eq('city', data.city)
        .neq('slug', slug)
        .limit(4);

      if (!suggestionsError) setSuggestedStations(suggestions || []);

      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('Unexpected error occurred. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch radio station when the slug changes
  useEffect(() => {
    fetchRadioStation();
  }, [slug]);

  // Initialize the audio player and handle events
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        const audioDuration = audioRef.current.duration || 0;
        setDuration(audioDuration);
      };

      const handleTimeUpdate = () => {
        const time = audioRef.current?.currentTime || 0;
        setCurrentTime(time);

        if (time < duration - 5) {
          setIsLive(false);
        }
      };

      // Set the initial volume
      audioRef.current.volume = volume;

      // Attach event listeners
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

      // Attempt to autoplay
      const attemptAutoplay = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Autoplay failed, manual interaction needed:', error);
          setIsPlaying(false);
        }
      };

      attemptAutoplay();

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [volume, duration]);

  // Update local time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Rewind audio by 5 seconds
  const rewind5Seconds = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 5);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsLive(false);
    }
  };

  // Forward audio by 5 seconds
  const forward5Seconds = () => {
    if (audioRef.current) {
      const newTime = Math.min(duration, audioRef.current.currentTime + 5);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      if (newTime >= duration - 5) {
        setIsLive(true);
      }
    }
  };

  // Handle volume change and mute toggle
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (!isNaN(newVolume) && newVolume >= 0 && newVolume <= 1) {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      setIsMuted(!isMuted);
      const newVolume = isMuted ? 0.5 : 0;
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
    }
  };

  // Format time to MM:SS
  const formatTime = (time) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Share radio station
  const shareRadioStation = () => {
    if (navigator.share) {
      navigator.share({
        title: radioStation.radioname,
        text: `Check out this radio station: ${radioStation.radioname}`,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  return (
    <div className={styles.radioPlayerContainer}>
      {loading && <div className={styles.loadingSpinner}>Loading...</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      {radioStation && !loading && (
        <>
          {/* Station Info */}
          <div className={styles.stationInfoContainer}>
            {radioStation.logo_url ? (
              <img
                src={radioStation.logo_url}
                alt={`${radioStation.radioname} Logo`}
                className={styles.stationLogo}
              />
            ) : (
              <div className={styles.fallbackInfo}>
                <p className={styles.stationFallback}>{radioStation.frequency || 'Online Only'}</p>
                <p className={styles.stationCity}>{radioStation.city}, {radioStation.country}</p>
              </div>
            )}
            <div className={styles.stationDetails}>
              <h2 className={styles.stationName}>{radioStation.radioname}</h2>
              <p className={styles.stationFrequency}>{radioStation.frequency || 'Online Only'}</p>
              <p className={styles.stationLocation}>{radioStation.city}, {radioStation.country}</p>
              {isLive && <span className={styles.liveBadge}>Live</span>}
              <button onClick={shareRadioStation} className={styles.shareButton}>
                <FaShareAlt /> Share
              </button>
            </div>
          </div>

          {/* Digital Clock */}
          <div className={styles.digitalClock}>
            Local Time: {localTime.toLocaleTimeString()}
          </div>

          {/* Media Player Controls */}
          <div className={styles.mediaControls}>
            <button
              onClick={rewind5Seconds}
              className={`${styles.controlButton} ${styles.rewindButton}`}
              aria-label="Rewind 5 seconds"
            >
              <FaBackward />
            </button>

            <button
              onClick={togglePlay}
              className={`${styles.controlButton} ${styles.playPauseButton}`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              onClick={forward5Seconds}
              className={`${styles.controlButton} ${styles.forwardButton}`}
              aria-label="Forward 5 seconds"
            >
              <FaForward />
            </button>

            {/* Time Display */}
            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume Controls */}
            <div className={styles.volumeControl}>
              <button onClick={toggleMute} className={styles.muteButton} aria-label="Mute">
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                id="volume-slider"
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

            <audio
              ref={audioRef}
              src={radioStation?.stream_url}
              volume={volume}
              preload="metadata"
            />
          </div>

          {/* Frequency Selector */}
          {radioStation.frequency && (
            <div className={styles.frequencyBox}>
              <div className={styles.frequencyLines}>
                {Array.from({ length: 23 }, (_, i) => {
                  const freq = 88 + i * 1;
                  return (
                    <div
                      key={freq}
                      className={freq === radioStation.frequency ? styles.redLine : styles.line}
                    ></div>
                  );
                })}
              </div>
            </div>
          )}

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
                    <p className={styles.suggestionFrequency}>{station.frequency || 'Online Only'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RadioPlayer;
