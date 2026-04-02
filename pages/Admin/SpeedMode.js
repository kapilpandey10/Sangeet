import React, { useState } from 'react';
import { FaBolt, FaYoutube, FaCheck, FaTimes, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import styles from './style/SpeedMode.module.css';

// ─── Helpers ─────────────────────────────────────────────────
const getYouTubeID = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || (url.trim().length === 11 ? url.trim() : null);
};

const generateSlug = (t) =>
  t.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// ─── oEmbed fetch — no API key needed ────────────────────────
const fetchYouTubeMeta = async (url) => {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );
  if (!res.ok) throw new Error('Could not fetch video info');
  return res.json();
  // returns: { title, author_name, thumbnail_url }
};

// ─── Parse "Artist - Title" pattern from YouTube titles ──────
const parseTitle = (raw) => {
  const sep = raw.indexOf(' - ');
  if (sep !== -1) {
    return {
      artist: raw.slice(0, sep).trim(),
      title:  raw.slice(sep + 3).trim(),
    };
  }
  // fallback: use full title, leave artist blank for admin to fill
  return { artist: '', title: raw.trim() };
};

// ═══════════════════════════════════════════════════════════════
const SpeedMode = ({ onSuccess }) => {
  const [url, setUrl]           = useState('');
  const [meta, setMeta]         = useState(null);   // fetched YT data
  const [title, setTitle]       = useState('');
  const [artist, setArtist]     = useState('');
  const [language, setLanguage] = useState('Nepali');
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(''), 4000);
  };

  // ── Step 1: Fetch from YouTube ──────────────────────────────
  const handleFetch = async () => {
    setError('');
    setMeta(null);
    const id = getYouTubeID(url);
    if (!id) { setError('Invalid YouTube URL or ID'); return; }

    setLoading(true);
    try {
      const data = await fetchYouTubeMeta(`https://www.youtube.com/watch?v=${id}`);
      const parsed = parseTitle(data.title);

      setMeta({
        videoId:      id,
        rawTitle:     data.title,
        thumbnail:    data.thumbnail_url,
        channelName:  data.author_name,
      });
      setTitle(parsed.title);
      setArtist(parsed.artist || data.author_name);
    } catch (e) {
      setError('Could not load video info. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Save as "coming_soon" to DB ─────────────────────
  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lyrics/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug:           generateSlug(title),
          artist,
          lyrics:         '',           // empty — coming soon
          english_lyrics: '',
          music_url:      `https://www.youtube.com/watch?v=${meta.videoId}`,
          thumbnail_url:  meta.thumbnail,
          status:         'approved',   // live immediately as coming-soon page
          status_type:    'coming_soon',
          language,
          published_date: new Date().toISOString().split('T')[0],
          added_by:       'Admin (Speed Mode)',
          description:    `Lyrics coming soon for "${title}" by ${artist}.`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      showToast(`✓ "${title}" published as Coming Soon`);
      // Reset
      setUrl(''); setMeta(null); setTitle(''); setArtist('');
      onSuccess?.();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setUrl(''); setMeta(null); setTitle(''); setArtist(''); setError('');
  };

  return (
    <div className={styles.speedWrapper}>
      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.speedHeader}>
        <FaBolt className={styles.boltIcon} />
        <div>
          <p className={styles.speedTitle}>SPEED MODE</p>
          <p className={styles.speedSub}>Paste a YouTube URL → publish as Coming Soon in one click</p>
        </div>
      </div>

      {/* ── URL Input ── */}
      <div className={styles.urlRow}>
        <div className={styles.urlInputWrap}>
          <FaYoutube className={styles.ytIcon} />
          <input
            className={styles.urlInput}
            type="text"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); setMeta(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
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
          {loading ? <FaSpinner className={styles.spin} /> : 'Fetch'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ── Preview card ── */}
      {meta && (
        <div className={styles.previewCard}>
          <img src={meta.thumbnail} alt={meta.rawTitle} className={styles.previewThumb} />

          <div className={styles.previewFields}>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Song Title</label>
              <input
                className={styles.fieldInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Artist</label>
              <input
                className={styles.fieldInput}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Language</label>
              <select
                className={styles.fieldInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>Nepali</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Maithili</option>
                <option>Newari</option>
                <option>Other</option>
              </select>
            </div>

            {/* What the public will see */}
            <div className={styles.publicPreview}>
              <p className={styles.publicPreviewLabel}>Public page will show:</p>
              <div className={styles.publicPreviewBox}>
                <span className={styles.comingSoonBadge}>🎵 Lyrics Coming Soon</span>
                <p className={styles.publicPreviewText}>
                  Visitors can submit lyrics or request them from admin.
                </p>
              </div>
            </div>

            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || !title.trim() || !artist.trim()}
            >
              {saving
                ? <><FaSpinner className={styles.spin} /> Publishing...</>
                : <><FaPaperPlane /> Publish as Coming Soon</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      {!meta && (
        <div className={styles.howItWorks}>
          <p className={styles.howTitle}>How it works</p>
          <ol className={styles.howList}>
            <li>Paste any YouTube video URL above</li>
            <li>Title, artist &amp; thumbnail auto-fill from YouTube</li>
            <li>Edit if needed, then publish instantly</li>
            <li>Visitors see a Coming Soon page and can submit lyrics</li>
            <li>You review &amp; approve submissions in the lyrics editor</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default SpeedMode;