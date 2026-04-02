import React, { useState, useRef } from 'react';
import {
  FaBolt, FaYoutube, FaTimes, FaSpinner, FaPaperPlane,
  FaMusic, FaPen, FaGlobe, FaCalendar, FaMicrophone,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaEye, FaEnvelope, FaAlignLeft, FaUser, FaChevronDown,
  FaChevronUp, FaTag
} from 'react-icons/fa';
import styles from './style/Speedmode.module.css';

// ─── Helpers ────────────────────────────────────────────────
const getYouTubeID = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || (url.trim().length === 11 ? url.trim() : null);
};

const generateSlug = (t) =>
  t.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const fetchYouTubeMeta = async (url) => {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );
  if (!res.ok) throw new Error('Could not fetch video info');
  return res.json();
};

const parseTitle = (raw) => {
  const patterns = [/ - /, / – /, / \| /];
  for (const sep of patterns) {
    const idx = raw.search(sep);
    if (idx !== -1) {
      const match = raw.match(sep);
      return { artist: raw.slice(0, idx).trim(), title: raw.slice(idx + match[0].length).trim() };
    }
  }
  return { artist: '', title: raw.trim() };
};

const cleanTitle = (t) =>
  t.replace(/\s*[\(\[](official\s*(video|audio|lyric|mv|music video)|lyrics?|hd|4k|ft\..+?)[\)\]]/gi, '')
   .replace(/\s*\|\s*.+$/, '').trim();

const guessLanguage = (title, channelName) => {
  const nepali = /[\u0900-\u097F]/;
  const combined = title + ' ' + channelName;
  if (nepali.test(combined)) return 'Nepali';
  const hints = combined.toLowerCase();
  if (hints.includes('hindi') || hints.includes('bollywood')) return 'Hindi';
  if (hints.includes('nepali') || hints.includes('nepal')) return 'Nepali';
  if (hints.includes('maithili')) return 'Maithili';
  if (hints.includes('newari') || hints.includes('newa')) return 'Newari';
  return 'Nepali';
};

const LANGUAGES = ['Nepali', 'English', 'Hindi', 'Maithili', 'Newari', 'Bhojpuri', 'Tamang', 'Other'];
const STATUS_OPTIONS = ['approved', 'pending', 'rejected'];
const STATUS_TYPE_OPTIONS = ['coming_soon', 'full', 'partial'];

const LYRICS_PLACEHOLDER =
  `Lyrics not available at the moment.\n\nYou can submit the lyrics by using the form below, and contact us — we'll review and publish them as soon as possible.`;

// ════════════════════════════════════════════════════════════
const SpeedMode = ({ onSuccess }) => {
  const [url, setUrl]                     = useState('');
  const [meta, setMeta]                   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [toast, setToast]                 = useState(null);
  const [step, setStep]                   = useState(1);
  const [showOptional, setShowOptional]   = useState(false);
  const urlRef = useRef(null);

  // ── All DB fields as state ───────────────────────────────
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  const [title, setTitle]                 = useState('');
  const [artist, setArtist]               = useState('');
  const [lyricsWriter, setLyricsWriter]   = useState('');
  const [language, setLanguage]           = useState('Nepali');
  const [publishedDate, setPublishedDate] = useState(`${currentYear}-01-01`);
  const [musicUrl, setMusicUrl]           = useState('');
  const [thumbnailUrl, setThumbnailUrl]   = useState('');
  const [slug, setSlug]                   = useState('');
  const [status, setStatus]               = useState('approved');
  const [statusType, setStatusType]       = useState('coming_soon');
  const [lyrics, setLyrics]               = useState(LYRICS_PLACEHOLDER);
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [description, setDescription]     = useState('');
  const [addedBy, setAddedBy]             = useState('Admin (Speed Mode)');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [clickCount, setClickCount]       = useState(1);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch YouTube meta ───────────────────────────────────
  const handleFetch = async () => {
    setError(''); setMeta(null);
    const id = getYouTubeID(url);
    if (!id) { setError('Invalid YouTube URL or video ID'); return; }
    setLoading(true);
    try {
      const data = await fetchYouTubeMeta(`https://www.youtube.com/watch?v=${id}`);
      const parsed = parseTitle(data.title);
      const cleanedTitle = cleanTitle(parsed.title);
      const resolvedArtist = parsed.artist || data.author_name;
      const detectedLang = guessLanguage(data.title, data.author_name);
      const yt = `https://www.youtube.com/watch?v=${id}`;

      setMeta({ videoId: id, rawTitle: data.title, thumbnail: data.thumbnail_url, channelName: data.author_name });
      setTitle(cleanedTitle);
      setArtist(resolvedArtist);
      setLyricsWriter(resolvedArtist);
      setLanguage(detectedLang);
      setPublishedDate(`${currentYear}-01-01`);
      setMusicUrl(yt);
      setThumbnailUrl(data.thumbnail_url);
      setSlug(generateSlug(cleanedTitle));
      setDescription(`Lyrics coming soon for "${cleanedTitle}" by ${resolvedArtist}.`);
      setLyrics(LYRICS_PLACEHOLDER);
      setStep(2);
    } catch {
      setError('Could not load video info. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save to DB ───────────────────────────────────────────
  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      const payload = {
        title,
        slug: slug || generateSlug(title),
        artist,
        lyrics_writer: lyricsWriter || undefined,
        lyrics,
        english_lyrics: englishLyrics || undefined,
        music_url: musicUrl,
        thumbnail_url: thumbnailUrl,
        status,
        status_type: statusType,
        language,
        published_date: publishedDate,
        click_count: Number(clickCount) || 1,
        added_by: addedBy || 'Admin (Speed Mode)',
        description: description || undefined,
        submitter_email: submitterEmail || undefined,
      };
      // Remove undefined keys so Supabase doesn't complain
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const res = await fetch('/api/admin/lyrics/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    setUrl(''); setMeta(null); setTitle(''); setArtist(''); setLyricsWriter('');
    setSlug(''); setError(''); setStep(1); setShowOptional(false);
    setLyrics(LYRICS_PLACEHOLDER); setEnglishLyrics(''); setDescription('');
    setSubmitterEmail(''); setClickCount(1); setStatus('approved'); setStatusType('coming_soon');
    setTimeout(() => urlRef.current?.focus(), 100);
  };

  // Auto-sync slug when title changes (only if not manually edited)
  const handleTitleChange = (v) => {
    setTitle(v);
    setSlug(generateSlug(v));
  };

  const isReady = title.trim() && artist.trim() && publishedDate;

  return (
    <div className={styles.speedWrapper}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success'
            ? <FaCheckCircle className={styles.toastIcon} />
            : <FaExclamationTriangle className={styles.toastIcon} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.speedHeader}>
        <div className={styles.boltWrap}><FaBolt className={styles.boltIcon} /></div>
        <div className={styles.headerText}>
          <div className={styles.speedBadge}>SPEED MODE</div>
          <p className={styles.speedSub}>Paste a YouTube link → auto-fill everything → publish in one click</p>
        </div>
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
        </div>
      </div>

      {/* URL Input */}
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
            {url && <button className={styles.clearUrl} onClick={reset}><FaTimes /></button>}
          </div>
          <button className={styles.fetchBtn} onClick={handleFetch} disabled={loading || !url.trim()}>
            {loading ? <><FaSpinner className={styles.spin} /> Fetching...</> : <><FaBolt /> Fetch Info</>}
          </button>
        </div>
        {error && <p className={styles.error}><FaExclamationTriangle style={{ marginRight: 5 }} />{error}</p>}
      </div>

      {/* Preview + Full Form */}
      {meta && (
        <div className={styles.previewCard}>

          {/* Thumbnail row */}
          <div className={styles.thumbSection}>
            <div className={styles.thumbWrap}>
              <img src={meta.thumbnail} alt={meta.rawTitle} className={styles.previewThumb} />
              <div className={styles.thumbOverlay}><FaYoutube className={styles.thumbYt} /></div>
            </div>
            <div className={styles.thumbMeta}>
              <p className={styles.thumbChannel}><FaMicrophone style={{ marginRight: 5, opacity: 0.6 }} />{meta.channelName}</p>
              <p className={styles.thumbRaw} title={meta.rawTitle}>
                {meta.rawTitle.length > 65 ? meta.rawTitle.slice(0, 65) + '…' : meta.rawTitle}
              </p>
              <a className={styles.thumbLink} href={`https://youtube.com/watch?v=${meta.videoId}`} target="_blank" rel="noopener noreferrer">
                <FaEye style={{ marginRight: 4 }} /> View on YouTube
              </a>
            </div>
          </div>

          {/* ── REQUIRED FIELDS ── */}
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelText}>Required Fields</span>
          </div>

          <div className={styles.fieldsGrid}>

            {/* Title */}
            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel}><FaMusic className={styles.fieldIcon} /> Song Title <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Song title" />
            </div>

            {/* Slug — auto but editable */}
            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel}><FaTag className={styles.fieldIcon} /> Slug <span className={styles.autoTag}>auto</span></label>
              <input className={`${styles.fieldInput} ${styles.fieldMono}`} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-slug" />
            </div>

            {/* Artist */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaMicrophone className={styles.fieldIcon} /> Artist / Singer <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name" />
            </div>

            {/* Lyrics Writer */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaPen className={styles.fieldIcon} /> Lyrics Writer</label>
              <input className={styles.fieldInput} value={lyricsWriter} onChange={(e) => setLyricsWriter(e.target.value)} placeholder="Lyricist name (optional)" />
            </div>

            {/* Language */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaGlobe className={styles.fieldIcon} /> Language</label>
              <select className={styles.fieldInput} value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Published Date */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaCalendar className={styles.fieldIcon} /> Published Date <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
            </div>

            {/* Status */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaCheckCircle className={styles.fieldIcon} /> Status</label>
              <select className={styles.fieldInput} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Status Type */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}><FaInfoCircle className={styles.fieldIcon} /> Status Type</label>
              <select className={styles.fieldInput} value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                {STATUS_TYPE_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

          </div>

          {/* ── LYRICS NOTICE / EDITABLE ── */}
          <div className={styles.lyricsNotice}>
            <div className={styles.lyricsNoticeHeader}>
              <FaInfoCircle className={styles.lyricsNoticeIcon} />
              <span>Lyrics Column Content</span>
              <div className={styles.comingSoonBadge}>
                <span className={styles.csBadgeDot} /> Coming Soon
              </div>
            </div>
            <div className={styles.lyricsNoticeBody}>
              <textarea
                className={`${styles.fieldInput} ${styles.lyricsTextarea}`}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={4}
                placeholder="Lyrics content (or coming soon message)"
              />
              <p className={styles.lyricsHint}>Visitors will see this text along with a submit form and contact link.</p>
            </div>
          </div>

          {/* ── OPTIONAL FIELDS TOGGLE ── */}
          <button className={styles.optionalToggle} onClick={() => setShowOptional(v => !v)}>
            {showOptional ? <FaChevronUp /> : <FaChevronDown />}
            {showOptional ? 'Hide' : 'Show'} optional fields
            <span className={styles.optionalCount}>
              music_url · thumbnail_url · english_lyrics · description · added_by · submitter_email · click_count
            </span>
          </button>

          {showOptional && (
            <div className={styles.optionalSection}>

              <div className={styles.fieldsGrid}>

                {/* Music URL */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}><FaYoutube className={styles.fieldIcon} /> Music URL <span className={styles.autoTag}>auto</span></label>
                  <input className={`${styles.fieldInput} ${styles.fieldMono}`} value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>

                {/* Thumbnail URL */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}><FaEye className={styles.fieldIcon} /> Thumbnail URL <span className={styles.autoTag}>auto</span></label>
                  <input className={`${styles.fieldInput} ${styles.fieldMono}`} value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
                </div>

                {/* English Lyrics */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}><FaAlignLeft className={styles.fieldIcon} /> English Lyrics <span className={styles.optTag}>optional</span></label>
                  <textarea
                    className={`${styles.fieldInput} ${styles.lyricsTextarea}`}
                    value={englishLyrics}
                    onChange={(e) => setEnglishLyrics(e.target.value)}
                    rows={3}
                    placeholder="English translation of lyrics (optional)"
                  />
                </div>

                {/* Description */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}><FaAlignLeft className={styles.fieldIcon} /> Description <span className={styles.autoTag}>auto</span></label>
                  <textarea
                    className={`${styles.fieldInput} ${styles.lyricsTextarea}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Short description for this song"
                  />
                </div>

                {/* Added By */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}><FaUser className={styles.fieldIcon} /> Added By</label>
                  <input className={styles.fieldInput} value={addedBy} onChange={(e) => setAddedBy(e.target.value)} placeholder="Admin name" />
                </div>

                {/* Submitter Email */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}><FaEnvelope className={styles.fieldIcon} /> Submitter Email <span className={styles.optTag}>optional</span></label>
                  <input className={styles.fieldInput} type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} placeholder="submitter@example.com" />
                </div>

                {/* Click Count */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}><FaTag className={styles.fieldIcon} /> Click Count</label>
                  <input className={`${styles.fieldInput} ${styles.fieldMono}`} type="number" min="0" value={clickCount} onChange={(e) => setClickCount(e.target.value)} />
                </div>

              </div>
            </div>
          )}

          {/* Action row */}
          <div className={styles.actionRow}>
            <button className={styles.resetBtn} onClick={reset} disabled={saving}>
              <FaTimes /> Start Over
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !isReady}>
              {saving
                ? <><FaSpinner className={styles.spin} /> Publishing...</>
                : <><FaPaperPlane /> Publish as Coming Soon</>}
            </button>
          </div>
        </div>
      )}

      {/* How it works idle state */}
      {!meta && !loading && (
        <div className={styles.howItWorks}>
          <p className={styles.howTitle}>What gets auto-filled from YouTube</p>
          <div className={styles.howGrid}>
            {[
              { icon: <FaMusic />,      label: 'Song Title',      desc: 'Parsed & cleaned from YouTube title' },
              { icon: <FaMicrophone />, label: 'Artist Name',     desc: 'Extracted from title or channel name' },
              { icon: <FaPen />,        label: 'Lyrics Writer',   desc: 'Defaults to artist, fully editable' },
              { icon: <FaCalendar />,   label: 'Published Date',  desc: 'Defaults to today, adjustable' },
              { icon: <FaGlobe />,      label: 'Language',        desc: 'Detected from Devanagari / keywords' },
              { icon: <FaYoutube />,    label: 'Thumbnail & URL', desc: 'Pulled directly from YouTube oEmbed' },
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