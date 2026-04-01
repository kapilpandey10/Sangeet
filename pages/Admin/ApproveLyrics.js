// File location: pages/Admin/ApproveLyrics.js
// Admin review panel for pending lyrics submissions.
// Clean, minimal black & white design. All editable fields exposed.

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ConfirmMsg from '../../components/ConfirmMsg';
import {
  FaYoutube, FaEdit, FaCheck, FaTimes, FaGlobe,
  FaCalendarAlt, FaLayerGroup, FaFileAlt, FaUserEdit,
  FaPenNib, FaLink, FaEnvelope, FaTag, FaAlignLeft,
  FaChevronDown, FaChevronUp, FaSearch
} from 'react-icons/fa';
import styles from './style/ApproveLyrics.module.css';

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics]   = useState([]);
  const [selectedLyric, setSelectedLyric]   = useState(null);
  const [editedLyric,   setEditedLyric]     = useState(null);
  const [message,       setMessage]         = useState({ text: '', type: '' });
  const [showConfirm,   setShowConfirm]     = useState(false);
  const [actionType,    setActionType]      = useState('');
  const [loading,       setLoading]         = useState(false);
  const [fetching,      setFetching]        = useState(true);
  const [searchQuery,   setSearchQuery]     = useState('');
  const [lyricsExpanded, setLyricsExpanded] = useState(false);
  const [enExpanded,     setEnExpanded]     = useState(false);

  // ── Fetch pending ─────────────────────────────────────────────────────────
  const fetchPending = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('lyrics')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (!error) setPendingLyrics(data || []);
    setFetching(false);
  };

  useEffect(() => { fetchPending(); }, []);

  // ── Confirm action (approve / reject) ─────────────────────────────────────
  const handleConfirmAction = async () => {
    setLoading(true);
    let error;

    if (actionType === 'approve') {
      // Re-generate slug if title changed
      const slug = editedLyric.slug || generateSlug(editedLyric.title);
      const { error: e } = await supabase
        .from('lyrics')
        .update({ ...editedLyric, slug, status: 'approved' })
        .eq('id', selectedLyric.id);
      error = e;
    } else {
      const { error: e } = await supabase
        .from('lyrics')
        .delete()
        .eq('id', selectedLyric.id);
      error = e;
    }

    if (!error) {
      setPendingLyrics(prev => prev.filter(l => l.id !== selectedLyric.id));
      setSelectedLyric(null);
      setEditedLyric(null);
      showMsg(
        actionType === 'approve' ? '✓ Published to library' : '✕ Submission discarded',
        actionType === 'approve' ? 'success' : 'error'
      );
    } else {
      showMsg('Error: ' + error.message, 'error');
    }

    setShowConfirm(false);
    setLoading(false);
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const generateSlug = (t = '') =>
    t.trim().toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

  const extractYTId = (url) =>
    url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  const set = (field) => (e) =>
    setEditedLyric(prev => ({ ...prev, [field]: e.target.value }));

  const selectLyric = (lyric) => {
    setSelectedLyric(lyric);
    setEditedLyric({ ...lyric });
    setLyricsExpanded(false);
    setEnExpanded(false);
  };

  // ── Filtered queue ────────────────────────────────────────────────────────
  const filteredQueue = pendingLyrics.filter(l =>
    !searchQuery ||
    l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ytId = extractYTId(editedLyric?.music_url);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {message.text && (
        <div className={`${styles.toast} ${message.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {message.text}
        </div>
      )}

      <div className={styles.layout}>

        {/* ══ SIDEBAR — Queue ══════════════════════════════════════════════ */}
        <aside className={styles.sidebar}>

          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              <FaLayerGroup className={styles.sidebarIcon} />
              <span>Review Queue</span>
            </div>
            <span className={styles.badge}>{pendingLyrics.length}</span>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search queue…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.queueList}>
            {fetching ? (
              <p className={styles.queueMeta}>Loading…</p>
            ) : filteredQueue.length === 0 ? (
              <p className={styles.queueEmpty}>
                {pendingLyrics.length === 0 ? 'Queue is clear ✓' : 'No matches'}
              </p>
            ) : filteredQueue.map((lyric) => (
              <button
                key={lyric.id}
                className={`${styles.queueItem} ${selectedLyric?.id === lyric.id ? styles.queueItemActive : ''}`}
                onClick={() => selectLyric(lyric)}
              >
                <img
                  src={lyric.thumbnail_url || '/logo/logo.webp'}
                  alt=""
                  className={styles.queueThumb}
                  onError={(e) => { e.target.src = '/logo/logo.webp'; }}
                />
                <div className={styles.queueText}>
                  <p className={styles.queueTitle}>{lyric.title}</p>
                  <p className={styles.queueArtist}>{lyric.artist}</p>
                  {lyric.added_by?.includes('(public)') && (
                    <span className={styles.publicTag}>public</span>
                  )}
                </div>
                <span className={styles.pendingDot} />
              </button>
            ))}
          </div>
        </aside>

        {/* ══ MAIN — Inspector ═════════════════════════════════════════════ */}
        {selectedLyric && editedLyric ? (
          <main className={styles.inspector}>

            {/* ── Top bar ──────────────────────────────────────────────── */}
            <div className={styles.inspectorTop}>
              <div className={styles.inspectorMeta}>
                <h2 className={styles.inspectorTitle}>{editedLyric.title || '—'}</h2>
                <span className={styles.inspectorArtist}>{editedLyric.artist || '—'}</span>
                {editedLyric.added_by && (
                  <span className={styles.submittedBy}>
                    Submitted by: <strong>{editedLyric.added_by}</strong>
                    {editedLyric.submitter_email && (
                      <> · <a href={`mailto:${editedLyric.submitter_email}`} className={styles.emailLink}>
                        <FaEnvelope style={{ fontSize: 10 }} /> {editedLyric.submitter_email}
                      </a></>
                    )}
                  </span>
                )}
              </div>
              <div className={styles.actionBtns}>
                <button
                  className={styles.btnDiscard}
                  onClick={() => { setActionType('reject'); setShowConfirm(true); }}
                  disabled={loading}
                >
                  <FaTimes /> Discard
                </button>
                <button
                  className={styles.btnApprove}
                  onClick={() => { setActionType('approve'); setShowConfirm(true); }}
                  disabled={loading}
                >
                  <FaCheck /> Publish
                </button>
              </div>
            </div>

            <div className={styles.inspectorBody}>

              {/* ── Left column ────────────────────────────────────────── */}
              <div className={styles.colLeft}>

                {/* Video preview */}
                <div className={styles.videoCard}>
                  {ytId ? (
                    <iframe
                      className={styles.videoEmbed}
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="Preview"
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <div className={styles.noVideo}>
                      <FaYoutube className={styles.noVideoIcon} />
                      <span>No video attached</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                {editedLyric.thumbnail_url && (
                  <div className={styles.thumbRow}>
                    <img
                      src={editedLyric.thumbnail_url}
                      alt="Thumbnail"
                      className={styles.thumbPreview}
                    />
                  </div>
                )}

                {/* Core fields */}
                <div className={styles.fieldsCard}>
                  <h3 className={styles.cardTitle}>Track Details</h3>

                  <Field label="Title" icon={<FaEdit />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.title || ''} onChange={set('title')} />
                  </Field>

                  <Field label="Artist(s)" icon={<FaUserEdit />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.artist || ''} onChange={set('artist')} />
                  </Field>

                  <Field label="Lyrics Writer" icon={<FaPenNib />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.lyrics_writer || ''} onChange={set('lyrics_writer')} />
                  </Field>

                  <div className={styles.fieldRow}>
                    <Field label="Language" icon={<FaGlobe />}>
                      <input className={styles.input} type="text"
                        value={editedLyric.language || ''} onChange={set('language')} />
                    </Field>
                    <Field label="Release Date" icon={<FaCalendarAlt />}>
                      <input className={styles.input} type="date"
                        value={editedLyric.published_date || ''} onChange={set('published_date')} />
                    </Field>
                  </div>

                  <Field label="Slug (URL)" icon={<FaTag />}>
                    <div className={styles.slugRow}>
                      <input className={styles.input} type="text"
                        value={editedLyric.slug || ''} onChange={set('slug')}
                        placeholder="auto-generated on publish if empty" />
                      <button
                        type="button"
                        className={styles.slugGenBtn}
                        onClick={() => setEditedLyric(prev => ({
                          ...prev, slug: generateSlug(prev.title)
                        }))}
                      >
                        Generate
                      </button>
                    </div>
                  </Field>

                  <Field label="YouTube URL" icon={<FaYoutube />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.music_url || ''} onChange={set('music_url')} />
                  </Field>

                  <Field label="Thumbnail URL" icon={<FaLink />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.thumbnail_url || ''} onChange={set('thumbnail_url')} />
                  </Field>

                  <Field label="Added By" icon={<FaUserEdit />}>
                    <input className={styles.input} type="text"
                      value={editedLyric.added_by || ''} onChange={set('added_by')} />
                  </Field>
                </div>

                {/* Description */}
                <div className={styles.fieldsCard}>
                  <h3 className={styles.cardTitle}>Description</h3>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={editedLyric.description || ''}
                    onChange={set('description')}
                    placeholder="Short description about the track…"
                  />
                </div>

              </div>

              {/* ── Right column — Lyrics ───────────────────────────────── */}
              <div className={styles.colRight}>

                {/* Original lyrics */}
                <div className={styles.lyricsCard}>
                  <div className={styles.lyricsCardHeader}>
                    <div className={styles.lyricsCardTitle}>
                      <FaFileAlt className={styles.lyricsIcon} />
                      <span>Original Lyrics</span>
                      <span className={styles.charCount}>
                        {(editedLyric.lyrics || '').length} chars
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.expandBtn}
                      onClick={() => setLyricsExpanded(p => !p)}
                    >
                      {lyricsExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      {lyricsExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  <textarea
                    className={`${styles.lyricsTextarea} ${lyricsExpanded ? styles.lyricsExpanded : ''}`}
                    value={editedLyric.lyrics || ''}
                    onChange={set('lyrics')}
                    placeholder="Original lyrics…"
                  />
                </div>

                {/* English translation */}
                <div className={styles.lyricsCard}>
                  <div className={styles.lyricsCardHeader}>
                    <div className={styles.lyricsCardTitle}>
                      <FaAlignLeft className={styles.lyricsIcon} />
                      <span>English Translation</span>
                      <span className={styles.charCount}>
                        {(editedLyric.english_lyrics || '').length} chars
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.expandBtn}
                      onClick={() => setEnExpanded(p => !p)}
                    >
                      {enExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      {enExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  <textarea
                    className={`${styles.lyricsTextarea} ${enExpanded ? styles.lyricsExpanded : ''}`}
                    value={editedLyric.english_lyrics || ''}
                    onChange={set('english_lyrics')}
                    placeholder="English translation (optional)…"
                  />
                </div>

                {/* Read-only info strip */}
                <div className={styles.infoStrip}>
                  <InfoChip label="ID" value={selectedLyric.id} />
                  <InfoChip label="Created" value={
                    selectedLyric.created_at
                      ? new Date(selectedLyric.created_at).toLocaleDateString()
                      : '—'
                  } />
                  <InfoChip label="Source" value={
                    selectedLyric.added_by?.includes('(public)') ? 'Public submission' : 'Admin'
                  } />
                  {selectedLyric.submitter_email && (
                    <InfoChip label="Email" value={selectedLyric.submitter_email} />
                  )}
                </div>

              </div>
            </div>
          </main>

        ) : (
          /* ── Empty state ─────────────────────────────────────────────── */
          <main className={styles.emptyState}>
            {pendingLyrics.length === 0 && !fetching ? (
              <>
                <FaCheck className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>All clear</h3>
                <p className={styles.emptyMsg}>No submissions pending review</p>
              </>
            ) : (
              <>
                <FaLayerGroup className={styles.emptyIcon} />
                <p className={styles.emptyMsg}>Select a track from the queue to begin review</p>
              </>
            )}
          </main>
        )}
      </div>

      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={handleConfirmAction}
          onCancel={() => setShowConfirm(false)}
          message={
            actionType === 'approve'
              ? `Publish "${selectedLyric?.title}" to the library?`
              : `Permanently discard "${selectedLyric?.title}"?`
          }
        />
      )}
    </div>
  );
};

// ── Small helper components ───────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div className={styles.field}>
    <label className={styles.fieldLabel}>
      {icon && <span className={styles.fieldIcon}>{icon}</span>}
      {label}
    </label>
    {children}
  </div>
);

const InfoChip = ({ label, value }) => (
  <div className={styles.infoChip}>
    <span className={styles.infoChipLabel}>{label}</span>
    <span className={styles.infoChipValue}>{value}</span>
  </div>
);

export default ApproveLyrics;