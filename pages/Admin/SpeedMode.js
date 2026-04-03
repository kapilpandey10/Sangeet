import React, { useState, useRef } from 'react';
import {
  FaBolt, FaYoutube, FaTimes, FaSpinner, FaPaperPlane,
  FaMusic, FaPen, FaGlobe, FaCalendar, FaMicrophone,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaEye,
  FaEnvelope, FaAlignLeft, FaToggleOn, FaUser, FaLink,
  FaClock, FaTag, FaChartBar, FaCompactDisc, FaWifi,
  FaCopy, FaChevronDown, FaChevronUp, FaMagic,
} from 'react-icons/fa';
import styles from './style/Speedmode.module.css';

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Robustly extract YouTube video ID from any YouTube URL format.
 * Handles: youtu.be/ID, youtube.com/watch?v=ID, ?list= params, etc.
 */
const getYouTubeID = (url) => {
  const trimmed = url.trim();
  try {
    // Try as a full URL first
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      // https://youtu.be/VIDEO_ID?list=...
      const id = parsed.pathname.slice(1).split('/')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // https://youtube.com/watch?v=VIDEO_ID&list=...
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // https://youtube.com/embed/VIDEO_ID
      const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      // https://youtube.com/shorts/VIDEO_ID
      const shortsMatch = parsed.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch (_) {
    // Not a valid URL — try regex fallback
  }

  // Regex fallback: match 11-char ID anywhere
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
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
      const m = raw.match(sep);
      return {
        artist: raw.slice(0, idx).trim(),
        title:  raw.slice(idx + m[0].length).trim(),
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
  if (/[\u0900-\u097F]/.test(combined))                             return 'Nepali';
  if (combined.includes('hindi') || combined.includes('bollywood')) return 'Hindi';
  if (combined.includes('nepali') || combined.includes('nepal'))    return 'Nepali';
  if (combined.includes('maithili'))                                return 'Maithili';
  if (combined.includes('newari') || combined.includes('newa'))     return 'Newari';
  if (combined.includes('bhojpuri'))                                return 'Bhojpuri';
  if (combined.includes('tamang'))                                  return 'Tamang';
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

const cleanDescription = (desc) => {
  if (!desc) return '';
  return desc
    .split('\n')
    .filter(line => !line.trim().startsWith('#') || line.trim().length > 20)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// ─── Smart Description Parser ─────────────────────────────────
/**
 * Scans the raw YouTube description for Singer and Lyrics Writer fields.
 *
 * Handles patterns like:
 *   Singer: Prakash Saput, Shanti Shree Pariyar
 *   Singer/Vocal: ...
 *   Lyrics Writer: ...
 *   Lyrics / Written by: ...
 *   Lyricist: ...
 *   Vocalist: ...
 *   etc.
 *
 * Returns { singers: string[], lyricsWriters: string[] }
 */
const parseDescriptionForCredits = (description) => {
  if (!description) return { singers: [], lyricsWriters: [] };

  const lines = description.split('\n');

  // Keyword groups
  const singerKeywords    = /^(singer|vocal|vocalist|performed\s*by|voice|sung\s*by|playback|artist)s?/i;
  const lyricsKeywords    = /^(lyric|lyrics|lyricist|written\s*by|words\s*by|poem|poetry|lyrics\s*writer|lyrics\s*by|words)s?(\s*\/\s*music)?(\s*writer)?/i;

  const extract = (line) => {
    // Remove the key part before the colon
    const after = line.replace(/^[^:]+:\s*/, '').trim();
    if (!after) return [];
    // Split by comma or slash (but not slashes in "Lyrics/Music: ...")
    return after
      .split(/[,\/]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 60 && !/^(http|www|#)/.test(s));
  };

  const singers      = [];
  const lyricsWriters = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes(':')) continue;

    const key = trimmed.split(':')[0].trim();

    if (singerKeywords.test(key)) {
      const names = extract(trimmed);
      singers.push(...names);
    } else if (lyricsKeywords.test(key)) {
      const names = extract(trimmed);
      lyricsWriters.push(...names);
    }
  }

  // Deduplicate
  const unique = (arr) => [...new Set(arr.map(s => s.trim()).filter(Boolean))];
  return {
    singers:       unique(singers),
    lyricsWriters: unique(lyricsWriters),
  };
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

const Field = ({ icon, label, optional, full, hint, children }) => (
  <div className={`${styles.fieldGroup} ${full ? styles.fieldFull : ''}`}>
    <label className={styles.fieldLabel}>
      <span className={styles.fieldIcon}>{icon}</span>
      {label}
      {optional && <span className={styles.optionalTag}>optional</span>}
      {hint && <span className={styles.hintTag}>{hint}</span>}
    </label>
    {children}
  </div>
);

// ─── Description Viewer ───────────────────────────────────────

const DescriptionViewer = ({ rawDescription, onApplySinger, onApplyLyricsWriter, parsedCredits }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  if (!rawDescription) return null;

  return (
    <div className={styles.descViewerWrap}>
      <div className={styles.descViewerHeader}>
        <div className={styles.descViewerTitle}>
          <FaAlignLeft style={{ marginRight: 6, opacity: 0.6 }} />
          <span>Full YouTube Description</span>
          {parsedCredits && (parsedCredits.singers.length > 0 || parsedCredits.lyricsWriters.length > 0) && (
            <span className={styles.creditsFoundBadge}>
              <FaMagic style={{ marginRight: 4 }} />
              Credits detected
            </span>
          )}
        </div>
        <div className={styles.descViewerActions}>
          <button className={styles.descCopyBtn} onClick={handleCopy} type="button">
            <FaCopy style={{ marginRight: 4 }} />
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            className={styles.descToggleBtn}
            onClick={() => setExpanded(e => !e)}
            type="button"
          >
            {expanded ? <><FaChevronUp style={{ marginRight: 4 }} />Collapse</> : <><FaChevronDown style={{ marginRight: 4 }} />Expand</>}
          </button>
        </div>
      </div>

      {/* Auto-detected credits strip */}
      {parsedCredits && (parsedCredits.singers.length > 0 || parsedCredits.lyricsWriters.length > 0) && (
        <div className={styles.creditsStrip}>
          {parsedCredits.singers.length > 0 && (
            <div className={styles.creditRow}>
              <span className={styles.creditKey}>
                <FaMicrophone style={{ marginRight: 5, opacity: 0.7 }} />
                Singer(s):
              </span>
              <span className={styles.creditValue}>{parsedCredits.singers.join(', ')}</span>
              <button
                className={styles.creditApplyBtn}
                onClick={() => onApplySinger(parsedCredits.singers.join(', '))}
                type="button"
                title="Apply to Artist field"
              >
                Apply to Artist
              </button>
            </div>
          )}
          {parsedCredits.lyricsWriters.length > 0 && (
            <div className={styles.creditRow}>
              <span className={styles.creditKey}>
                <FaPen style={{ marginRight: 5, opacity: 0.7 }} />
                Lyricist(s):
              </span>
              <span className={styles.creditValue}>{parsedCredits.lyricsWriters.join(', ')}</span>
              <button
                className={styles.creditApplyBtn}
                onClick={() => onApplyLyricsWriter(parsedCredits.lyricsWriters.join(', '))}
                type="button"
                title="Apply to Lyrics Writer field"
              >
                Apply to Writer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scrollable description body */}
      <div
        className={`${styles.descViewerBody} ${expanded ? styles.descViewerExpanded : styles.descViewerCollapsed}`}
      >
        <pre className={styles.descViewerPre}>{rawDescription}</pre>
      </div>

      {!expanded && (
        <button
          className={styles.descShowMore}
          onClick={() => setExpanded(true)}
          type="button"
        >
          Show full description <FaChevronDown style={{ marginLeft: 4 }} />
        </button>
      )}
    </div>
  );
};

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
  const [scrapeNote, setScrapeNote] = useState('');
  const [rawDescription, setRawDescription] = useState(''); // full untruncated description
  const [parsedCredits, setParsedCredits]   = useState(null);

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

  // ── Fetch via API route ──────────────────────────────────────
  const handleFetch = async () => {
    setError('');
    setMeta(null);
    setThumbError(false);
    setScrapeNote('');
    setRawDescription('');
    setParsedCredits(null);

    const id = getYouTubeID(url);
    if (!id) {
      setError('Invalid YouTube URL or video ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/youtube-meta?videoId=${id}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Could not fetch video info');
      }

      const parsed  = parseTitle(data.title);
      const cleaned = cleanTitle(parsed.title || data.title);

      // Resolve artist: music:musician → parsed title → channel name
      const resolvedArtist =
        data.musicArtist ||
        parsed.artist    ||
        data.channelName ||
        '';

      const uploadYear = data.uploadDate
        ? new Date(data.uploadDate).getFullYear().toString()
        : currentYear.toString();

      // Keep full raw description for the viewer panel
      const fullDesc = data.description || '';
      setRawDescription(fullDesc);

      // Parse credits from description
      const credits = parseDescriptionForCredits(fullDesc);
      setParsedCredits(credits);

      // Auto-apply singer if found and no music:musician meta
      const finalArtist = data.musicArtist
        ? data.musicArtist
        : credits.singers.length > 0
          ? credits.singers.join(', ')
          : resolvedArtist;

      const finalLyricsWriter = credits.lyricsWriters.length > 0
        ? credits.lyricsWriters.join(', ')
        : finalArtist;

      // Build SEO description (trimmed, without hashtag spam)
      const ytDescClean = cleanDescription(fullDesc);
      const autoDesc = ytDescClean
        ? ytDescClean.slice(0, 600)
        : `Lyrics for "${cleaned}" by ${finalArtist}.`;

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
        hasExtras:   !!(data.duration || data.uploadDate || data.description),
      });

      setTitle(data.musicSong || cleaned);
      setArtist(finalArtist);
      setLyricsWriter(finalLyricsWriter);
      setLanguage(guessLanguage(data.title, data.channelName || ''));
      setYear(uploadYear);
      setDescription(autoDesc);
      setStep(2);

      if (!data.duration && !data.uploadDate && !data.description) {
        setScrapeNote('Basic info loaded via oEmbed. Extra details (duration, views, description) were unavailable — YouTube may have blocked the scrape.');
      }
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
    setScrapeNote('');
    setRawDescription('');
    setParsedCredits(null);
    setStep(1);
    setTimeout(() => urlRef.current?.focus(), 100);
  };

  const isReady = title.trim() && artist.trim() && year;

  const thumbSrc = thumbError
    ? `https://img.youtube.com/vi/${meta?.videoId}/hqdefault.jpg`
    : meta?.thumbnail;

  // ─────────────────────────────────────────────────────────────
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

      {/* ── URL Input ── */}
      <div className={styles.inputSection}>
        <div className={styles.urlRow}>
          <div className={`${styles.urlInputWrap} ${error ? styles.urlInputError : ''}`}>
            <FaYoutube className={styles.ytIcon} />
            <input
              ref={urlRef}
              className={styles.urlInput}
              type="text"
              placeholder="https://youtu.be/... or youtube.com/watch?v=... or video ID"
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
            <FaExclamationTriangle style={{ marginRight: 6 }} />
            {error}
          </p>
        )}
      </div>

      {/* ── Preview card ── */}
      {meta && (
        <div className={styles.previewCard}>

          {/* Partial data notice */}
          {scrapeNote && (
            <div className={styles.scrapeNotice}>
              <FaWifi style={{ marginRight: 6, opacity: 0.7 }} />
              {scrapeNote}
            </div>
          )}

          {/* ── Thumbnail + quick meta ── */}
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
              <p className={styles.thumbChannel}>
                <FaMicrophone style={{ marginRight: 5, opacity: 0.6 }} />
                {meta.channelName}
              </p>
              <p className={styles.thumbRaw} title={meta.rawTitle}>
                {meta.rawTitle.length > 80
                  ? meta.rawTitle.slice(0, 80) + '…'
                  : meta.rawTitle}
              </p>

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

              {meta.tags && meta.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {meta.tags.slice(0, 8).map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

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

          {/* ── Full Description Viewer (NEW) ── */}
          {rawDescription && (
            <>
              <div className={styles.sectionHeader}>
                <FaAlignLeft className={styles.sectionIcon} /> YouTube Description
              </div>
              <DescriptionViewer
                rawDescription={rawDescription}
                parsedCredits={parsedCredits}
                onApplySinger={(val) => setArtist(val)}
                onApplyLyricsWriter={(val) => setLyricsWriter(val)}
              />
            </>
          )}

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

            <Field
              icon={<FaAlignLeft />}
              label="Description"
              hint="auto-filled from YouTube"
              full
            >
              <div className={styles.descWrapper}>
                <textarea
                  className={`${styles.fieldInput} ${styles.textarea} ${styles.descTextarea}`}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Description for SEO and public page — pulled from YouTube automatically"
                />
                {description && (
                  <div className={styles.descFooter}>
                    <span className={styles.descCount}>{description.length} / 600 chars</span>
                    <button
                      className={styles.descClear}
                      onClick={() => setDescription('')}
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
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

          {/* ── Actions ── */}
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
              { icon: <FaMusic />,       label: 'Song Title',       desc: 'Parsed & cleaned from full YouTube title' },
              { icon: <FaMicrophone />,  label: 'Artist Name',      desc: 'From music metadata, title parse, or channel' },
              { icon: <FaMagic />,       label: 'Singer / Lyricist', desc: 'Auto-detected from video description credits' },
              { icon: <FaCompactDisc />, label: 'Album & Genre',    desc: 'Detected from YouTube structured data' },
              { icon: <FaCalendar />,    label: 'Upload Date',      desc: 'Exact date → auto-fills the year field' },
              { icon: <FaChartBar />,    label: 'View Count',       desc: 'Pulled from JSON-LD structured data' },
              { icon: <FaClock />,       label: 'Duration',         desc: 'Formatted from ISO 8601 (e.g. 3:45)' },
              { icon: <FaTag />,         label: 'Tags & Keywords',  desc: 'Up to 8 YouTube tags shown in preview' },
              { icon: <FaGlobe />,       label: 'Language',         desc: 'Detected from title and channel name' },
              { icon: <FaAlignLeft />,   label: 'Description',      desc: 'Scrollable full description — copy lyrics from it' },
              { icon: <FaYoutube />,     label: 'Thumbnail & URL',  desc: 'maxresdefault with hqdefault fallback' },
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