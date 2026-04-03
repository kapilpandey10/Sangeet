import React, { useState, useRef } from 'react';
import {
  FaBolt, FaYoutube, FaTimes, FaSpinner, FaPaperPlane,
  FaMusic, FaPen, FaGlobe, FaCalendar, FaMicrophone,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaEye,
  FaEnvelope, FaAlignLeft, FaToggleOn, FaUser, FaLink,
  FaClock, FaTag, FaChartBar, FaCompactDisc,
} from 'react-icons/fa';
import styles from './style/Speedmode.module.css';

// ─── Helpers ──────────────────────────────────────────────────

const getYouTubeID = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || (url.trim().length === 11 ? url.trim() : null);
};

const generateSlug = (t) =>
  t.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const parseTitle = (raw) => {
  const patterns = [/ - /, / – /, / \| /];
  for (const sep of patterns) {
    const idx = raw.search(sep);
    if (idx !== -1) {
      const match = raw.match(sep);
      return {
        artist: raw.slice(0, idx).trim(),
        title:  raw.slice(idx + match[0].length).trim(),
      };
    }
  }
  return { artist: '', title: raw.trim() };
};

const cleanTitle = (t) =>
  t.replace(
    /\s*[\(\[](official\s*(video|audio|lyric|mv|music video)|lyrics?|hd|4k|ft\..+?)[\)\]]/gi,
    ''
  ).replace(/\s*\|\s*.+$/, '').trim();

const guessLanguage = (title, channelName) => {
  const combined = (title + ' ' + channelName).toLowerCase();
  if (/[\u0900-\u097F]/.test(combined))                               return 'Nepali';
  if (combined.includes('hindi') || combined.includes('bollywood'))   return 'Hindi';
  if (combined.includes('nepali') || combined.includes('nepal'))      return 'Nepali';
  if (combined.includes('maithili'))                                  return 'Maithili';
  if (combined.includes('newari') || combined.includes('newa'))       return 'Newari';
  if (combined.includes('bhojpuri'))                                  return 'Bhojpuri';
  if (combined.includes('tamang'))                                    return 'Tamang';
  return 'Nepali';
};

const formatViews = (n) => {
  const num = Number(n);
  if (!num) return null;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ─── Constants ────────────────────────────────────────────────

const LANGUAGES    = ['Nepali', 'English', 'Hindi', 'Maithili', 'Newari', 'Bhojpuri', 'Tamang', 'Other'];
const STATUS_TYPES = ['coming_soon', 'published', 'draft', 'pending'];
const STATUSES     = ['approved', 'pending', 'rejected'];

const LYRICS_PLACEHOLDER =
  'Lyrics not available at the moment.\n\n' +
  "You can submit the lyrics by using the form below, and contact us — " +
  "we'll review and publish them as soon as possible.";

// ─── Field wrapper ────────────────────────────────────────────

const Field = ({ icon, label, optional, full, children }) => (
  <div className={`${styles.fieldGroup} ${full ? styles.fieldFull : ''}`}>
    <label className={styles.fieldLabel}>
      <span className={styles.fieldIcon}>{icon}</span>
      {label}
      {optional && <span className={styles.optionalTag}>optional</span>}
    </label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const SpeedMode = ({ onSuccess }) => {
  const [url, setUrl]               = useState('');
  const [meta, setMeta]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState(null);
  const [step, setStep]             = useState(1);
  const [thumbError, setThumbError] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  const [title, setTitle]                   = useState('');
  const [artist, setArtist]                 = useState('');
  const [lyricsWriter, setLyricsWriter]     = useState('');
  const [language, setLanguage]             = useState('Nepali');
  const [year, setYear]                     = useState(currentYear.toString());
  const [lyrics, setLyrics]                 = useState(LYRICS_PLACEHOLDER);
  const [englishLyrics, setEnglishLyrics]   = useState('');
  const [description, setDescription]       = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [addedBy, setAddedBy]               = useState('Admin (Speed Mode)');
  const [status, setStatus]                 = useState('approved');
  const [statusType, setStatusType]         = useState('coming_soon');
  const [clickCount, setClickCount]         = useState(1);

  const urlRef = useRef(null);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch via server-side scraper ────────────────────────────
  const handleFetch = async () => {
    setError('');
    setMeta(null);
    setThumbError(false);

    const id = getYouTubeID(url);
    if (!id) { setError('Invalid YouTube URL or video ID'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/youtube-meta?videoId=${id}`);
      if (!res.ok) throw new Error('Could not fetch video info');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.title) throw new Error('Video not found or private');

      const parsed  = parseTitle(data.title);
      const cleaned = cleanTitle(parsed.title || data.title);

      // music:musician (official music videos) > parsed artist > channel
      const resolvedArtist =
        data.musicArtist ||
        parsed.artist    ||
        data.channelName ||
        '';

      const uploadYear = data.uploadDate
        ? new Date(data.uploadDate).getFullYear().toString()
        : currentYear.toString();

      const autoDesc = data.description
        ? data.description.replace(/\n+/g, ' ').slice(0, 200).trim()
        : `Lyrics for "${cleaned}" by ${resolvedArtist}.`;

      setMeta({
        videoId:     id,
        rawTitle:    data.title,
        thumbnail:   data.thumbnail,
        channelName: data.channelName,
        duration:    data.duration,
        uploadDate:  data.uploadDate,
        viewCount:   data.viewCount,
        tags:        data.tags || [],
        genre:       data.genre,
        musicSong:   data.musicSong,
        musicAlbum:  data.musicAlbum,
      });

      setTitle(data.musicSong || cleaned);
      setArtist(resolvedArtist);
      setLyricsWriter(resolvedArtist);
      setLanguage(guessLanguage(data.title, data.channelName || ''));
      setYear(uploadYear);
      setDescription(autoDesc);
      setStep(2);
    } catch (e) {
      setError(e.message || 'Could not load video info. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      const payload = {
        title,
        slug:            generateSlug(title),
        artist,
        lyrics_writer:   lyricsWriter  || undefined,
        lyrics,
        english_lyrics:  englishLyrics || undefined,
        music_url:       `https://www.youtube.com/watch?v=${meta.videoId}`,
        thumbnail_url:   meta.thumbnail,
        status,
        status_type:     statusType,
        language,
        published_date:  `${year}-01-01`,
        click_count:     Number(clickCount) || 1,
        added_by:        addedBy           || undefined,
        description:     description       || undefined,
        submitter_email: submitterEmail    || undefined,
      };

      const res = await fetch('/api/admin/lyrics/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      showToast(`"${title}" published successfully!`, 'success');
      reset();
      onSuccess?.();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────
  const reset = () => {
    setUrl('');
    setMeta(null);
    setTitle('');
    setArtist('');
    setLyricsWriter('');
    setDescription('');
    setSubmitterEmail('');
    setEnglishLyrics('');
    setLyrics(LYRICS_PLACEHOLDER);
    setStatus('approved');
    setStatusType('coming_soon');
    setClickCount(1);
    setAddedBy('Admin (Speed Mode)');
    setError('');
    setThumbError(false);
    setStep(1);
    setTimeout(() => urlRef.current?.focus(), 100);
  };

  const isReady = title.trim() && artist.trim() && year;

  // hqdefault fallback when maxresdefault 404s
  const thumbSrc = thumbError
    ? `https://img.youtube.com/vi/${meta?.videoId}/hqdefault.jpg`
    : meta?.thumbnail;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.speedWrapper}>

      {/* ── Toast notification ── */}
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

      {/* ── URL Input ── */}
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
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
                if (meta) setStep(1);
              }}
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
            <FaExclamationTriangle style={{ marginRight: 5 }} />
            {error}
          </p>
        )}
      </div>

      {/* ── Preview card (shown after fetch) ── */}
      {meta && (
        <div className={styles.previewCard}>

          {/* Thumbnail + enriched metadata */}
          <div className={styles.thumbSection}>
            <div className={styles.thumbWrap}>
              <img
                src={thumbSrc}
                alt={meta.rawTitle}
                className={styles.previewThumb}
                onError={() => setThumbError(true)}
              />
              <div className={styles.thumbOverlay}>
                <FaYoutube className={styles.thumbYt} />
                {meta.duration && (
                  <span className={styles.durationBadge}>
                    {meta.duration.formatted}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.thumbMeta}>

              {/* Channel name */}
              <p className={styles.thumbChannel}>
                <FaMicrophone style={{ marginRight: 5, opacity: 0.6 }} />
                {meta.channelName}
              </p>

              {/* Full raw title */}
              <p className={styles.thumbRaw} title={meta.rawTitle}>
                {meta.rawTitle.length > 80
                  ? meta.rawTitle.slice(0, 80) + '…'
                  : meta.rawTitle}
              </p>

              {/* Music-specific fields — only present on official music videos */}
              {(meta.musicSong || meta.musicAlbum) && (
                <div className={styles.musicMeta}>
                  {meta.musicSong && (
                    <span className={styles.musicField}>
                      <FaMusic style={{ marginRight: 4, opacity: 0.6 }} />
                      {meta.musicSong}
                    </span>
                  )}
                  {meta.musicAlbum && (
                    <span className={styles.musicField}>
                      <FaCompactDisc style={{ marginRight: 4, opacity: 0.6 }} />
                      {meta.musicAlbum}
                    </span>
                  )}
                </div>
              )}

              {/* Stats chips — inlined to avoid JSX parser issues */}
              <div className={styles.chipsRow}>
                {meta.duration && (
                  <span className={styles.chip}>
                    <span className={styles.chipIcon}><FaClock /></span>
                    {meta.duration.formatted}
                  </span>
                )}
                {meta.uploadDate && (
                  <span className={styles.chip}>
                    <span className={styles.chipIcon}><FaCalendar /></span>
                    {formatDate(meta.uploadDate)}
                  </span>
                )}
                {meta.viewCount && (
                  <span className={styles.chip}>
                    <span className={styles.chipIcon}><FaChartBar /></span>
                    {formatViews(meta.viewCount)} views
                  </span>
                )}
                {meta.genre && (
                  <span className={styles.chip}>
                    <span className={styles.chipIcon}><FaTag /></span>
                    {meta.genre}
                  </span>
                )}
              </div>

              {/* Tags */}
              {meta.tags && meta.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {meta.tags.slice(0, 8).map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              {/* YouTube link */}
              <a
                className={styles.thumbLink}
                href={`https://youtube.com/watch?v=${meta.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaEye style={{ marginRight: 4 }} />
                View on YouTube
              </a>

            </div>
          </div>

          {/* ── Core Information ── */}
          <div className={styles.sectionHeader}>
            <FaMusic className={styles.sectionIcon} /> Core Information
          </div>
          <div className={styles.fieldsGrid}>
            <Field icon={<FaMusic />} label="Song Title" full>
              <input
                className={styles.fieldInput}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Song title"
              />
            </Field>
            <Field icon={<FaMicrophone />} label="Artist / Singer">
              <input
                className={styles.fieldInput}
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Artist name"
              />
            </Field>
            <Field icon={<FaPen />} label="Lyrics Writer" optional>
              <input
                className={styles.fieldInput}
                value={lyricsWriter}
                onChange={e => setLyricsWriter(e.target.value)}
                placeholder="Who wrote the lyrics?"
              />
            </Field>
            <Field icon={<FaGlobe />} label="Language">
              <select
                className={styles.fieldInput}
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field icon={<FaCalendar />} label="Published Year">
              <select
                className={styles.fieldInput}
                value={year}
                onChange={e => setYear(e.target.value)}
              >
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          {/* ── Lyrics Content ── */}
          <div className={styles.sectionHeader}>
            <FaAlignLeft className={styles.sectionIcon} /> Lyrics Content
          </div>
          <div className={styles.fieldsGrid}>
            <Field icon={<FaAlignLeft />} label="Lyrics (Original)" full>
              <textarea
                className={`${styles.fieldInput} ${styles.textarea}`}
                value={lyrics}
                onChange={e => setLyrics(e.target.value)}
                rows={5}
                placeholder="Paste lyrics or leave as Coming Soon message"
              />
            </Field>
            <Field icon={<FaAlignLeft />} label="English Lyrics" optional full>
              <textarea
                className={`${styles.fieldInput} ${styles.textarea}`}
                value={englishLyrics}
                onChange={e => setEnglishLyrics(e.target.value)}
                rows={3}
                placeholder="English translation (leave blank if not available)"
              />
            </Field>
            <Field icon={<FaAlignLeft />} label="Description" optional full>
              <textarea
                className={`${styles.fieldInput} ${styles.textarea}`}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Short description shown on public page / used for SEO"
              />
            </Field>
          </div>

          {/* ── Publishing & Meta ── */}
          <div className={styles.sectionHeader}>
            <FaToggleOn className={styles.sectionIcon} /> Publishing &amp; Meta
          </div>
          <div className={styles.fieldsGrid}>
            <Field icon={<FaToggleOn />} label="Status">
              <select
                className={styles.fieldInput}
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field icon={<FaToggleOn />} label="Status Type">
              <select
                className={styles.fieldInput}
                value={statusType}
                onChange={e => setStatusType(e.target.value)}
              >
                {STATUS_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field icon={<FaLink />} label="Click Count" optional>
              <input
                className={styles.fieldInput}
                type="number"
                min={0}
                value={clickCount}
                onChange={e => setClickCount(e.target.value)}
              />
            </Field>
            <Field icon={<FaUser />} label="Added By" optional>
              <input
                className={styles.fieldInput}
                value={addedBy}
                onChange={e => setAddedBy(e.target.value)}
                placeholder="e.g. Admin (Speed Mode)"
              />
            </Field>
            <Field icon={<FaEnvelope />} label="Submitter Email" optional>
              <input
                className={styles.fieldInput}
                type="email"
                value={submitterEmail}
                onChange={e => setSubmitterEmail(e.target.value)}
                placeholder="submitter@email.com"
              />
            </Field>
          </div>

          {/* ── Coming Soon notice ── */}
          <div className={styles.lyricsNotice}>
            <div className={styles.lyricsNoticeHeader}>
              <FaInfoCircle className={styles.lyricsNoticeIcon} />
              <span>Visitor-facing message when lyrics are left as default</span>
            </div>
            <div className={styles.lyricsNoticeBody}>
              <div className={styles.comingSoonBadge}>
                <span className={styles.csBadgeDot} /> Lyrics Coming Soon
              </div>
              <p className={styles.lyricsNoticeText}>
                <strong>Lyrics not available at the moment.</strong> Visitors will be
                invited to submit lyrics using the form below, or contact us. You
                review &amp; approve from the lyrics editor.
              </p>
            </div>
          </div>

          {/* ── Action buttons ── */}
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

      {/* ── Empty state: how it works ── */}
      {!meta && !loading && (
        <div className={styles.howItWorks}>
          <p className={styles.howTitle}>What gets auto-filled</p>
          <div className={styles.howGrid}>
            {[
              { icon: <FaMusic />,       label: 'Song Title',      desc: 'Parsed & cleaned from full YouTube title' },
              { icon: <FaMicrophone />,  label: 'Artist Name',     desc: 'From music metadata, title parse, or channel' },
              { icon: <FaCompactDisc />, label: 'Album & Genre',   desc: 'Detected from YouTube structured data' },
              { icon: <FaCalendar />,    label: 'Upload Date',     desc: 'Exact date → auto-fills the year field' },
              { icon: <FaChartBar />,    label: 'View Count',      desc: 'Pulled from JSON-LD structured data' },
              { icon: <FaClock />,       label: 'Duration',        desc: 'Formatted from ISO 8601 (e.g. 3:45)' },
              { icon: <FaTag />,         label: 'Tags & Keywords', desc: 'Up to 8 YouTube tags shown in preview' },
              { icon: <FaGlobe />,       label: 'Language',        desc: 'Detected from title and channel name' },
              { icon: <FaAlignLeft />,   label: 'Description',     desc: 'First 200 chars auto-filled from YouTube' },
              { icon: <FaYoutube />,     label: 'Thumbnail & URL', desc: 'maxresdefault with hqdefault fallback' },
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