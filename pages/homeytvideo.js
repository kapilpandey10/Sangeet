// File location: pages/homeytvideo.jsx
// Retro CRT TV component — YouTube video plays inside a TV bezel.
// A transparent overlay blocks all YouTube controls (no pause, no seek, no fullscreen).
// Song rotates every 5 minutes in sync across all devices via UTC time.
// Keeps all original logic intact.

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import styles from '../styles/HomeYTVideo.module.css';

const HomeYTVideo = () => {
  const [videoUrl,   setVideoUrl]   = useState('');
  const [loading,    setLoading]    = useState(true);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [lyricsData, setLyricsData] = useState(null);
  const [powered,    setPowered]    = useState(false); // TV power-on animation
  const router = useRouter();

  // ── Fetch video for current 5-minute UTC interval ─────────────────────────
  const fetchVideoForInterval = async () => {
    setLoading(true);
    try {
      const { data: lyricsWithVideos, error } = await supabase
        .from('lyrics')
        .select('title, artist, music_url, slug')
        .not('music_url', 'is', null)
        .eq('status', 'approved');

      if (error) throw new Error('Error fetching videos');

      if (lyricsWithVideos && lyricsWithVideos.length > 0) {
        const currentUTCMinutes = new Date().getUTCMinutes();
        const intervalIndex     = Math.floor(currentUTCMinutes / 5) % lyricsWithVideos.length;
        const selected          = lyricsWithVideos[intervalIndex];
        setVideoUrl(selected.music_url);
        setLyricsData(selected);
      } else {
        throw new Error('No videos found');
      }
    } catch (err) {
      console.error(err);
      setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    } finally {
      setLoading(false);
    }
  };

  // ── Video rotation every 5 minutes ────────────────────────────────────────
  useEffect(() => {
    fetchVideoForInterval();
    const interval = setInterval(fetchVideoForInterval, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Power-on animation delay ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setPowered(true), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Countdown timer ────────────────────────────────────────────────────────
  const calculateTimeLeft = () => {
    const now       = new Date();
    const elapsed   = (now.getUTCMinutes() % 5) * 60 + now.getUTCSeconds();
    return 5 * 60 - elapsed;
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── YouTube ID extractor ───────────────────────────────────────────────────
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const m = url.match(regex);
    return m ? m[1] : null;
  };

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;
  const videoId     = extractYouTubeId(videoUrl);

  // autoplay=1 mute=0 — controls=0 hides native controls (overlay handles the rest)
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`
    : null;

  const handleViewLyrics = () => {
    if (lyricsData?.slug) router.push(`/viewlyrics/${lyricsData.slug}`);
  };

  return (
    <div className={styles.scene}>

      {/* ── TV CABINET ──────────────────────────────────────────────────────── */}
      <div className={`${styles.tv} ${powered ? styles.tvOn : ''}`}>

        {/* Top antenna */}
        <div className={styles.antennaLeft}  aria-hidden />
        <div className={styles.antennaRight} aria-hidden />

        {/* Main body */}
        <div className={styles.tvBody}>

          {/* ── SCREEN AREA ──────────────────────────────────────────────── */}
          <div className={styles.screenBezel}>
            <div className={styles.screenInner}>

              {/* CRT curve vignette */}
              <div className={styles.crtVignette} aria-hidden />

              {/* Scanlines */}
              <div className={styles.scanlines} aria-hidden />

              {/* Phosphor flicker */}
              <div className={`${styles.flicker} ${powered ? styles.flickerOn : ''}`} aria-hidden />

              {/* Power-off static */}
              {!powered && <div className={styles.static} aria-hidden />}

              {/* VIDEO */}
              {powered && !loading && embedUrl && (
                <iframe
                  className={styles.videoFrame}
                  src={embedUrl}
                  title="DynaBeat TV"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}

              {/* Loading state */}
              {powered && loading && (
                <div className={styles.loadingScreen}>
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                </div>
              )}

              {/* TRANSPARENT CONTROL BLOCKER — covers entire screen */}
              <div className={styles.controlBlocker} aria-hidden />

              {/* Top-left channel bug */}
              <div className={styles.channelBug} aria-hidden>
                <span className={styles.liveDot} />
                LIVE
              </div>

              {/* Bottom info bar */}
              {lyricsData && powered && !loading && (
                <div className={styles.infoBar}>
                  <div className={styles.infoLeft}>
                    <span className={styles.infoTitle}>{lyricsData.title}</span>
                    <span className={styles.infoArtist}>{lyricsData.artist}</span>
                  </div>
                  <div className={styles.infoRight}>
                    <span className={styles.infoTimer}>
                      Next in {minutesLeft}:{String(secondsLeft).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CONTROL PANEL ──────────────────────────────────────────────── */}
          <div className={styles.controlPanel}>

            {/* Brand badge */}
            <div className={styles.brandBadge}>
              <span className={styles.brandName}>Dyna</span><span className={styles.brandAccent}>Beat</span>
              <span className={styles.brandTagline}>COLOR · TV</span>
            </div>

            {/* Decorative knobs */}
            <div className={styles.knobs}>
              <div className={styles.knobGroup}>
                <div className={styles.knob} style={{ '--r': '45deg' }} aria-hidden />
                <span className={styles.knobLabel}>CH</span>
              </div>
              <div className={styles.knobGroup}>
                <div className={styles.knob} style={{ '--r': '-30deg' }} aria-hidden />
                <span className={styles.knobLabel}>VOL</span>
              </div>
            </div>

            {/* Power indicator */}
            <div className={styles.powerArea}>
              <div className={`${styles.powerLed} ${powered ? styles.powerLedOn : ''}`} aria-hidden />
              <span className={styles.powerLabel}>PWR</span>
            </div>

            {/* Speaker grille */}
            <div className={styles.speaker} aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.speakerSlot} />
              ))}
            </div>

          </div>
        </div>

        {/* TV legs */}
        <div className={styles.legs}>
          <div className={styles.leg} aria-hidden />
          <div className={styles.leg} aria-hidden />
        </div>

      </div>

      {/* ── VIEW LYRICS BUTTON (outside TV) ──────────────────────────────── */}
      {lyricsData && powered && !loading && (
        <button className={styles.lyricsBtn} onClick={handleViewLyrics}>
          View Lyrics
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

    </div>
  );
};

export default HomeYTVideo;