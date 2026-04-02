import React, { useState, useRef } from 'react';
import {
  FaBolt, FaYoutube, FaTimes, FaSpinner, FaPaperPlane,
  FaMusic, FaPen, FaGlobe, FaCalendar, FaMicrophone,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaEye,
  FaEnvelope, FaAlignLeft, FaToggleOn, FaUser, FaLink
} from 'react-icons/fa';
import styles from './style/Speedmode.module.css';

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
  const combined = title + ' ' + channelName;
  if (/[\u0900-\u097F]/.test(combined)) return 'Nepali';
  const h = combined.toLowerCase();
  if (h.includes('hindi') || h.includes('bollywood')) return 'Hindi';
  if (h.includes('nepali') || h.includes('nepal'))    return 'Nepali';
  if (h.includes('maithili'))                          return 'Maithili';
  if (h.includes('newari') || h.includes('newa'))      return 'Newari';
  return 'Nepali';
};

const LANGUAGES    = ['Nepali', 'English', 'Hindi', 'Maithili', 'Newari', 'Bhojpuri', 'Tamang', 'Other'];
const STATUS_TYPES = ['coming_soon', 'published', 'draft', 'pending'];
const STATUSES     = ['approved', 'pending', 'rejected'];

const LYRICS_PLACEHOLDER =
  "Lyrics not available at the moment.\n\nYou can submit the lyrics by using the form below, and contact us — we'll review and publish them as soon as possible.";

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

const SpeedMode = ({ onSuccess }) => {
  const [url, setUrl]                       = useState('');
  const [meta, setMeta]                     = useState(null);
  const [loading, setLoading]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');
  const [toast, setToast]                   = useState(null);
  const [step, setStep]                     = useState(1);

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

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
      const thumbUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      const ytUrl = `https://www.youtube.com/watch?v=${id}`;
      setMeta({ videoId: id, rawTitle: data.title, thumbnail: thumbUrl, channelName: data.author_name });
      setTitle(cleanedTitle);
      setArtist(resolvedArtist);
      setLyricsWriter(resolvedArtist);
      setLanguage(guessLanguage(data.title, data.author_name));
      setYear(currentYear.toString());
      setMusicUrl(ytUrl);
      setThumbnailUrl(thumbUrl);
      setSlug(generateSlug(cleanedTitle));
      setDescription(`Lyrics coming soon for "${cleanedTitle}" by ${resolvedArtist}.`);
      setStep(2);
    } catch (e) {
      setError('Could not load video info. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      const payload = {
        title,
        slug:            generateSlug(title),
        artist,
        lyrics_writer:   lyricsWriter    || undefined,
        lyrics,
        english_lyrics:  englishLyrics   || undefined,
        music_url:       `https://www.youtube.com/watch?v=${meta.videoId}`,
        thumbnail_url:   meta.thumbnail,
        status,
        status_type:     statusType,
        language,
        published_date:  `${year}-01-01`,
        click_count:     Number(clickCount) || 1,
        added_by:        addedBy           || undefined,
        description:     description        || undefined,
        submitter_email: submitterEmail     || undefined,
      };
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
    setDescription(''); setSubmitterEmail(''); setEnglishLyrics('');
    setLyrics(LYRICS_PLACEHOLDER); setStatus('approved'); setStatusType('coming_soon');
    setClickCount(1); setAddedBy('Admin (Speed Mode)'); setError(''); setStep(1);
    setTimeout(() => urlRef.current?.focus(), 100);
  };

  const isReady = title.trim() && artist.trim() && year;

  return (
    <div className={styles.speedWrapper}>

      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success'
            ? <FaCheckCircle className={styles.toastIcon} />
            : <FaExclamationTriangle className={styles.toastIcon} />}
          {toast.msg}
        </div>
      )}

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
            {url && <button className={styles.clearUrl} onClick={reset} title="Clear"><FaTimes /></button>}
          </div>
          <button className={styles.fetchBtn} onClick={handleFetch} disabled={loading || !url.trim()}>
            {loading ? <><FaSpinner className={styles.spin} /> Fetching...</> : <><FaBolt /> Fetch Info</>}
          </button>
        </div>
        {error && <p className={styles.error}><FaExclamationTriangle style={{ marginRight: 5 }} />{error}</p>}
      </div>

      {meta && (
        <div className={styles.previewCard}>

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

          <div className={styles.sectionHeader}>
            <FaMusic className={styles.sectionIcon} /> Core Information
          </div>
          <div className={styles.fieldsGrid}>
            <Field icon={<FaMusic />} label="Song Title" full>
              <input className={styles.fieldInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Song title" />
            </Field>
            <Field icon={<FaMicrophone />} label="Artist / Singer">
              <input className={styles.fieldInput} value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" />
            </Field>
            <Field icon={<FaPen />} label="Lyrics Writer" optional>
              <input className={styles.fieldInput} value={lyricsWriter} onChange={e => setLyricsWriter(e.target.value)} placeholder="Who wrote the lyrics?" />
            </Field>
            <Field icon={<FaGlobe />} label="Language">
              <select className={styles.fieldInput} value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field icon={<FaCalendar />} label="Published Year">
              <select className={styles.fieldInput} value={year} onChange={e => setYear(e.target.value)}>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
          </div>

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

          <div className={styles.sectionHeader}>
            <FaToggleOn className={styles.sectionIcon} /> Publishing &amp; Meta
          </div>
          <div className={styles.fieldsGrid}>
            <Field icon={<FaToggleOn />} label="Status">
              <select className={styles.fieldInput} value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field icon={<FaToggleOn />} label="Status Type">
              <select className={styles.fieldInput} value={statusType} onChange={e => setStatusType(e.target.value)}>
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
              <input className={styles.fieldInput} value={addedBy} onChange={e => setAddedBy(e.target.value)} placeholder="e.g. Admin (Speed Mode)" />
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
                <strong>Lyrics not available at the moment.</strong> Visitors will be invited to submit lyrics using the form below, or contact us. You review &amp; approve from the lyrics editor.
              </p>
            </div>
          </div>

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

      {!meta && !loading && (
        <div className={styles.howItWorks}>
          <p className={styles.howTitle}>What gets auto-filled</p>
          <div className={styles.howGrid}>
            {[
              { icon: <FaMusic />,      label: 'Song Title',     desc: 'Parsed & cleaned from YouTube title' },
              { icon: <FaMicrophone />, label: 'Artist Name',    desc: 'Extracted from title or channel name' },
              { icon: <FaPen />,        label: 'Lyrics Writer',  desc: 'Auto-guessed, editable before saving' },
              { icon: <FaCalendar />,   label: 'Published Year', desc: 'Defaults to current year, adjustable' },
              { icon: <FaGlobe />,      label: 'Language',       desc: 'Detected from title / channel name' },
              { icon: <FaYoutube />,    label: 'Thumbnail & URL',desc: 'Pulled directly from YouTube oEmbed' },
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