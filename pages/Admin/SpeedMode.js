import React, { useState, useRef } from 'react';
import {
  FaBolt, FaYoutube, FaTimes, FaSpinner, FaPaperPlane,
  FaMusic, FaPen, FaGlobe, FaCalendar, FaUser, FaMicrophone,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaEye
} from 'react-icons/fa';
import styles from './style/Speedmode.module.css';

// ─── Helpers ────────────────────────────────────────────────
const getYouTubeID = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || (url.trim().length === 11 ? url.trim() : null);
};

const generateSlug = (t) =>
  t.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// ─── oEmbed fetch ────────────────────────────────────────────
const fetchYouTubeMeta = async (url) => {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );
  if (!res.ok) throw new Error('Could not fetch video info');
  return res.json();
};

// ─── Parse "Artist - Title" from YouTube titles ─────────────
const parseTitle = (raw) => {
  // Try common patterns: "Artist - Title", "Artist – Title", "Artist | Title"
  const patterns = [/ - /, / – /, / \| /];
  for (const sep of patterns) {
    const idx = raw.search(sep);
    if (idx !== -1) {
      const match = raw.match(sep);
      return {
        artist: raw.slice(0, idx).trim(),
        title: raw.slice(idx + match[0].length).trim(),
      };
    }
  }
  return { artist: '', title: raw.trim() };
};

// ─── Strip common YouTube title suffixes ────────────────────
const cleanTitle = (t) =>
  t.replace(/\s*[\(\[](official\s*(video|audio|lyric|mv|music video)|lyrics?|hd|4k|ft\..+?)[\)\]]/gi, '')
   .replace(/\s*\|\s*.+$/, '')
   .trim();

// ─── Guess lyricist from description (heuristic) ────────────
const guessLyricist = (title, artist) => {
  // Basic heuristic — return artist as fallback; real app would scrape description
  return artist;
};

// ─── Detect language from channel/title ─────────────────────
const guessLanguage = (title, channelName) => {
  const nepali = /[\u0900-\u097F]/;   // Devanagari
  const combined = title + ' ' + channelName;
  if (nepali.test(combined)) return 'Nepali';
  const hints = combined.toLowerCase();
  if (hints.includes('hindi') || hints.includes('bollywood')) return 'Hindi';
  if (hints.includes('nepali') || hints.includes('nepal')) return 'Nepali';
  if (hints.includes('maithili')) return 'Maithili';
  if (hints.includes('newari') || hints.includes('newa')) return 'Newari';
  return 'Nepali'; // default for this app
};

const LANGUAGES = ['Nepali', 'English', 'Hindi', 'Maithili', 'Newari', 'Bhojpuri', 'Tamang', 'Other'];

const LYRICS_PLACEHOLDER = `Lyrics not available at the moment.

You can submit the lyrics by using the form below, and contact us — we'll review and publish them as soon as possible.`;

// ════════════════════════════════════════════════════════════
const SpeedMode = ({ onSuccess }) => {
  const [url, setUrl]             = useState('');
  const [meta, setMeta]           = useState(null);
  const [title, setTitle]         = useState('');
  const [artist, setArtist]       = useState('');
  const [lyricist, setLyricist]   = useState('');
  const [language, setLanguage]   = useState('Nepali');
  const [year, setYear]           = useState(new Date().getFullYear().toString());
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState(null);
  const [step, setStep]           = useState(1); // 1=input, 2=review
  const urlRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Step 1: Fetch from YouTube ───────────────────────────
  const handleFetch = async () => {
    setError('');
    setMeta(null);
    const id = getYouTubeID(url);
    if (!id) { setError('Invalid YouTube URL or video ID'); return; }

    setLoading(true);
    try {
      const data = await fetchYouTubeMeta(`https://www.youtube.com/watch?v=${id}`);
      const parsed = parseTitle(data.title);
      const cleanedTitle = cleanTitle(parsed.title);
      const resolvedArtist = parsed.artist || data.author_name;
      const detectedLang = guessLanguage(data.title, data.author_name);

      setMeta({
        videoId:     id,
        rawTitle:    data.title,
        thumbnail:   data.thumbnail_url,
        channelName: data.author_name,
      });
      setTitle(cleanedTitle);
      setArtist(resolvedArtist);
      setLyricist(guessLyricist(cleanedTitle, resolvedArtist));
      setLanguage(detectedLang);
      setYear(currentYear.toString());
      setStep(2);
    } catch (e) {
      setError('Could not load video info. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Save to DB ────────────────────────────────────
  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lyrics/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug:            generateSlug(title),
          artist,
          'lyrics-writer': lyricist,
          lyrics:          LYRICS_PLACEHOLDER,
          english_lyrics:  '',
          music_url:       `https://www.youtube.com/watch?v=${meta.videoId}`,
          thumbnail_url:   meta.thumbnail,
          status:          'approved',
          status_type:     'coming_soon',
          language,
          published_date:  `${year}-01-01`,
          click_count:     1,
          added_by:        'Admin (Speed Mode)',
          description:     `Lyrics coming soon for "${title}" by ${artist}.`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      showToast(`"${title}" published as Coming Soon`, 'success');
      reset();
      onSuccess?.();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setUrl(''); setMeta(null); setTitle(''); setArtist('');
    setLyricist(''); setError(''); setStep(1);
    setTimeout(() => urlRef.current?.focus(), 100);
  };

  const isReady = title.trim() && artist.trim() && year;

  return (
    <div className={styles.speedWrapper}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success'
            ? <FaCheckCircle className={styles.toastIcon} />
            : <FaExclamationTriangle className={styles.toastIcon} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.speedHeader}>
        <div className={styles.boltWrap}>
          <FaBolt className={styles.boltIcon} />
        </div>
        <div className={styles.headerText}>
          <div className={styles.speedBadge}>SPEED MODE</div>
          <p className={styles.speedSub}>
            Paste a YouTube link → auto-fill everything → publish in one click
          </p>
        </div>
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
        </div>
      </div>

      {/* ── STEP 1: URL Input ── */}
      <div className={styles.inputSection}>
        <div className={styles.urlRow}>
          <div className={`${styles.urlInputWrap} ${error ? styles.urlInputError : ''}`}>
            <FaYoutube className={styles.ytIcon} />
            <input
              ref={urlRef}
              className={styles.urlInput}
              type="text"
              placeholder="https://youtube.com/watch?v=... or video ID"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); if (meta) setStep(1); }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && url.trim() && handleFetch()}
              disabled={loading}
            />
            {url && (
              <button className={styles.clearUrl} onClick={reset} title="Clear">
                <FaTimes />
              </button>
            )}
          </div>
          <button
            className={styles.fetchBtn}
            onClick={handleFetch}
            disabled={loading || !url.trim()}
          >
            {loading
              ? <><FaSpinner className={styles.spin} /> Fetching...</>
              : <><FaBolt /> Fetch Info</>}
          </button>
        </div>

        {error && (
          <p className={styles.error}>
            <FaExclamationTriangle style={{ marginRight: 5 }} />{error}
          </p>
        )}
      </div>

      {/* ── STEP 2: Preview + Edit ── */}
      {meta && (
        <div className={styles.previewCard}>

          {/* Thumbnail + video info */}
          <div className={styles.thumbSection}>
            <div className={styles.thumbWrap}>
              <img src={meta.thumbnail} alt={meta.rawTitle} className={styles.previewThumb} />
              <div className={styles.thumbOverlay}>
                <FaYoutube className={styles.thumbYt} />
              </div>
            </div>
            <div className={styles.thumbMeta}>
              <p className={styles.thumbChannel}>
                <FaMicrophone style={{ marginRight: 5, opacity: 0.6 }} />
                {meta.channelName}
              </p>
              <p className={styles.thumbRaw} title={meta.rawTitle}>
                {meta.rawTitle.length > 60 ? meta.rawTitle.slice(0, 60) + '…' : meta.rawTitle}
              </p>
              <a
                className={styles.thumbLink}
                href={`https://youtube.com/watch?v=${meta.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaEye style={{ marginRight: 4 }} /> View on YouTube
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Fields grid */}
          <div className={styles.fieldsGrid}>

            {/* Song Title */}
            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel}>
                <FaMusic className={styles.fieldIcon} /> Song Title
              </label>
              <input
                className={styles.fieldInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
              />
            </div>

            {/* Artist */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <FaMicrophone className={styles.fieldIcon} /> Artist / Singer
              </label>
              <input
                className={styles.fieldInput}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
              />
            </div>

            {/* Lyricist */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <FaPen className={styles.fieldIcon} /> Lyricist / Writer
              </label>
              <input
                className={styles.fieldInput}
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
                placeholder="Lyricist name"
              />
            </div>

            {/* Language */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <FaGlobe className={styles.fieldIcon} /> Language
              </label>
              <select
                className={styles.fieldInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Published Year */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <FaCalendar className={styles.fieldIcon} /> Published Year
              </label>
              <select
                className={styles.fieldInput}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

          </div>

          {/* Lyrics notice */}
          <div className={styles.lyricsNotice}>
            <div className={styles.lyricsNoticeHeader}>
              <FaInfoCircle className={styles.lyricsNoticeIcon} />
              <span>Lyrics Content Preview</span>
            </div>
            <div className={styles.lyricsNoticeBody}>
              <div className={styles.comingSoonBadge}>
                <span className={styles.csBadgeDot} />
                Lyrics Coming Soon
              </div>
              <p className={styles.lyricsNoticeText}>
                <strong>Lyrics not available at the moment.</strong> Visitors will see a message inviting them to submit lyrics using the form below, or contact us directly. Once submitted, you can review and approve from the lyrics editor.
              </p>
              <div className={styles.lyricsMeta}>
                <span className={styles.lyricsMetaItem}><FaUser style={{marginRight:3}} /> click_count: <strong>1</strong></span>
                <span className={styles.lyricsMetaItem}><FaCheckCircle style={{marginRight:3}} /> status: <strong>approved</strong></span>
                <span className={styles.lyricsMetaItem}><FaMusic style={{marginRight:3}} /> status_type: <strong>coming_soon</strong></span>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className={styles.actionRow}>
            <button className={styles.resetBtn} onClick={reset} disabled={saving}>
              <FaTimes /> Start Over
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || !isReady}
            >
              {saving
                ? <><FaSpinner className={styles.spin} /> Publishing...</>
                : <><FaPaperPlane /> Publish as Coming Soon</>}
            </button>
          </div>
        </div>
      )}

      {/* ── How it works (only when idle) ── */}
      {!meta && !loading && (
        <div className={styles.howItWorks}>
          <p className={styles.howTitle}>What gets auto-filled</p>
          <div className={styles.howGrid}>
            {[
              { icon: <FaMusic />,       label: 'Song Title',       desc: 'Parsed & cleaned from YouTube title' },
              { icon: <FaMicrophone />,  label: 'Artist Name',      desc: 'Extracted from title or channel name' },
              { icon: <FaPen />,         label: 'Lyricist',         desc: 'Auto-guessed, editable before saving' },
              { icon: <FaCalendar />,    label: 'Published Year',   desc: 'Defaults to current year, adjustable' },
              { icon: <FaGlobe />,       label: 'Language',         desc: 'Detected from title / channel name' },
              { icon: <FaYoutube />,     label: 'Thumbnail & URL',  desc: 'Pulled directly from YouTube oEmbed' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className={styles.howItem}>
                <div className={styles.howItemIcon}>{icon}</div>
                <div>
                  <p className={styles.howItemLabel}>{label}</p>
                  <p className={styles.howItemDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedMode;