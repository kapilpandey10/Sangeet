// File location: pages/submitlyrics.js
// Public-facing lyrics submission form.
// No login required. Submissions are saved with status: 'pending'
// and must be approved by an admin before they appear on the site.

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../supabaseClient';
import { FaPlus, FaTrash, FaYoutube, FaCheckCircle } from 'react-icons/fa';
import styles from '../styles/SubmitLyrics.module.css';

const SubmitLyrics = () => {
  const [step, setStep]                 = useState(1); // 1 = form, 2 = success
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [videoError, setVideoError]     = useState('');
  const [thumbnail, setThumbnail]       = useState('');

  // Form fields
  const [title, setTitle]               = useState('');
  const [artists, setArtists]           = useState([{ name: '', suggestions: [] }]);
  const [language, setLanguage]         = useState('');
  const [writer, setWriter]             = useState('');
  const [releaseYear, setReleaseYear]   = useState(new Date().getFullYear());
  const [videoUrl, setVideoUrl]         = useState('');
  const [lyrics, setLyrics]             = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [description, setDescription]  = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');

  useEffect(() => {
    document.title = 'Submit Lyrics | DynaBeat';
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const generateSlug = (t) =>
    t.trim().toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const getYouTubeVideoID = (url) => {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] || (url.length === 11 ? url : null);
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (!url) { setThumbnail(''); setVideoError(''); return; }
    const videoId = getYouTubeVideoID(url);
    if (videoId) {
      setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      setVideoError('');
    } else {
      setThumbnail('');
      setVideoError('Doesn\'t look like a valid YouTube URL — double-check and try again.');
    }
  };

  // ── Artist autocomplete ───────────────────────────────────────────────────
  const handleArtistChange = async (index, e) => {
    const updated = [...artists];
    const val = e.target.value;
    updated[index].name = val;
    if (val.length > 1) {
      const { data } = await supabase
        .from('lyrics')
        .select('artist')
        .ilike('artist', `%${val}%`)
        .limit(5);
      updated[index].suggestions = data ? [...new Set(data.map(l => l.artist))] : [];
    } else {
      updated[index].suggestions = [];
    }
    setArtists(updated);
  };

  const selectArtist = (index, name) => {
    const updated = [...artists];
    updated[index].name = name;
    updated[index].suggestions = [];
    setArtists(updated);
  };

  const addArtist    = () => setArtists([...artists, { name: '', suggestions: [] }]);
  const removeArtist = (i) => setArtists(artists.filter((_, idx) => idx !== i));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim())  return setError('Track title is required.');
    if (!lyrics.trim()) return setError('Original lyrics are required.');
    if (!artists[0].name.trim()) return setError('At least one artist name is required.');

    // YouTube is optional for public submissions — but validate if provided
    let musicUrl = null;
    if (videoUrl.trim()) {
      const videoId = getYouTubeVideoID(videoUrl);
      if (!videoId) return setError('The YouTube URL you entered doesn\'t seem valid.');
      musicUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('lyrics').insert([{
        title:          title.trim(),
        slug:           generateSlug(title),
        artist:         artists.map(a => a.name.trim()).filter(Boolean).join(', '),
        lyrics_writer:  writer.trim() || null,
        lyrics:         lyrics.trim(),
        english_lyrics: englishLyrics.trim() || null,
        published_date: releaseYear ? `${releaseYear}-01-01` : null,
        music_url:      musicUrl,
        thumbnail_url:  thumbnail || null,
        description:    description.trim() || null,
        language:       language.trim() || 'Unknown',
        // ─── These two fields are what keep it out of the public site ───
        status:         'pending',
        added_by:       submitterName.trim()
                          ? `${submitterName.trim()} (public)`
                          : 'Anonymous (public)',
        // ─────────────────────────────────────────────────────────────────
        submitter_email: submitterEmail.trim() || null, // optional — for admin to credit
      }]);

      if (dbError) throw dbError;
      setStep(2);
    } catch (err) {
      setError('Something went wrong: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setTitle(''); setArtists([{ name: '', suggestions: [] }]); setLanguage('');
    setWriter(''); setReleaseYear(new Date().getFullYear()); setVideoUrl('');
    setLyrics(''); setEnglishLyrics(''); setDescription('');
    setSubmitterName(''); setSubmitterEmail(''); setThumbnail(''); setError('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <>
        <Head><title>Submitted! | DynaBeat</title></Head>
        <div className={styles.wrapper}>
          <div className={styles.successCard}>
            <FaCheckCircle className={styles.successIcon} />
            <h1 className={styles.successTitle}>Track Submitted!</h1>
            <p className={styles.successMsg}>
              Thank you for contributing to the DynaBeat library.
              Our team will review your submission and publish it once approved.
              This usually takes 1–3 days.
            </p>
            <div className={styles.successActions}>
              <button className={styles.submitBtn} onClick={handleReset}>
                Submit Another Track
              </button>
              <a href="/" className={styles.ghostBtn}>Back to Home</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Submit Lyrics | DynaBeat</title></Head>
      <div className={styles.wrapper}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <header className={styles.pageHeader}>
          <p className={styles.pageEyebrow}>Community Contribution</p>
          <h1 className={styles.pageTitle}>Submit <span>Lyrics</span></h1>
          <p className={styles.pageSubtitle}>
            Know a track that isn't in our library? Fill in what you know —
            every field marked <span className={styles.req}>*</span> is required.
            Your submission will be reviewed before going live.
          </p>
        </header>

        {/* ── Review notice banner ──────────────────────────────────────── */}
        <div className={styles.noticeBanner}>
          <span className={styles.noticeDot} aria-hidden />
          Submissions are reviewed by our team before publishing — usually within 1–3 days.
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ══ SECTION 1 — Track Info ════════════════════════════════════ */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>01</span> Track Info
            </h2>

            <div className={styles.fieldGrid2}>
              {/* Title */}
              <div className={`${styles.field} ${styles.spanFull}`}>
                <label className={styles.label}>
                  Track Title <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bohemian Rhapsody"
                  required
                />
              </div>

              {/* Artists */}
              <div className={`${styles.field} ${styles.spanFull}`}>
                <label className={styles.label}>
                  Singer / Artist <span className={styles.req}>*</span>
                </label>
                {artists.map((artist, index) => (
                  <div key={index} className={styles.artistGroup}>
                    <div className={styles.artistRow}>
                      <input
                        className={styles.input}
                        type="text"
                        value={artist.name}
                        onChange={(e) => handleArtistChange(index, e)}
                        placeholder="Artist name"
                        required={index === 0}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => removeArtist(index)}
                          aria-label="Remove artist"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    {artist.suggestions.length > 0 && (
                      <ul className={styles.suggestions}>
                        {artist.suggestions.map((s, i) => (
                          <li key={i} onClick={() => selectArtist(index, s)}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.addArtistBtn} onClick={addArtist}>
                  <FaPlus /> Add Another Artist
                </button>
              </div>

              {/* Writer */}
              <div className={styles.field}>
                <label className={styles.label}>Lyrics Writer</label>
                <input
                  className={styles.input}
                  type="text"
                  value={writer}
                  onChange={(e) => setWriter(e.target.value)}
                  placeholder="Who wrote the lyrics?"
                />
              </div>

              {/* Year */}
              <div className={styles.field}>
                <label className={styles.label}>Release Year</label>
                <input
                  className={styles.input}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                />
              </div>

              {/* Language */}
              <div className={styles.field}>
                <label className={styles.label}>Language</label>
                <input
                  className={styles.input}
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English, Nepali, Hindi…"
                />
              </div>

              {/* YouTube URL */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <FaYoutube className={styles.labelIcon} /> YouTube URL
                  <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  className={`${styles.input} ${videoError ? styles.inputError : ''}`}
                  type="text"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {videoError && <span className={styles.fieldError}>{videoError}</span>}
              </div>
            </div>

            {/* YouTube thumbnail preview */}
            {thumbnail && (
              <div className={styles.thumbPreview}>
                <img src={thumbnail} alt="YouTube thumbnail" className={styles.thumbImg} />
                <span className={styles.thumbLabel}>Thumbnail preview — looks good!</span>
              </div>
            )}
          </section>

          {/* ══ SECTION 2 — Lyrics ═══════════════════════════════════════ */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>02</span> Lyrics
            </h2>

            <div className={styles.lyricsRow}>
              <div className={styles.lyricsBox}>
                <label className={styles.lyricsLabel}>
                  Original Lyrics <span className={styles.req}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={16}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Paste or type the original lyrics here…"
                  required
                />
              </div>
              <div className={styles.lyricsBox}>
                <label className={styles.lyricsLabel}>
                  English Translation
                  <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={16}
                  value={englishLyrics}
                  onChange={(e) => setEnglishLyrics(e.target.value)}
                  placeholder="English version, if you have it…"
                />
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: '16px' }}>
              <label className={styles.lyricsLabel}>
                Short Description
                <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything interesting about this track — album, mood, story behind it…"
              />
            </div>
          </section>

          {/* ══ SECTION 3 — About You ════════════════════════════════════ */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>03</span> About You
              <span className={styles.sectionNote}>— so we can credit you</span>
            </h2>

            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label className={styles.label}>Your Name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="How should we credit you?"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="We won't share this publicly"
                />
              </div>
            </div>
          </section>

          {/* ── Submit row ───────────────────────────────────────────────── */}
          <div className={styles.submitRow}>
            <p className={styles.submitNote}>
              By submitting you confirm the lyrics are accurate to the best of your knowledge
              and you agree to our <a href="/terms" className={styles.submitNoteLink}>Terms of Service</a>.
            </p>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Submit for Review →'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default SubmitLyrics;