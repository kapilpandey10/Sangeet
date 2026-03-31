import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ConfirmMsg from '../../components/ConfirmMsg';
import {
  FaYoutube, FaEdit, FaCheck, FaTimes,
  FaGlobe, FaCalendarAlt, FaLayerGroup, FaFileAlt, FaUserEdit
} from 'react-icons/fa';
import styles from './style/ApproveLyrics.module.css';

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [editedLyric, setEditedLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      const { data, error } = await supabase
        .from('lyrics').select('*').eq('status', 'pending');
      if (!error) setPendingLyrics(data || []);
    };
    fetchPending();
  }, []);

  const handleConfirmAction = async () => {
    setLoading(true);
    const op = actionType === 'approve'
      ? supabase.from('lyrics').update({ ...editedLyric, status: 'approved' }).eq('id', selectedLyric.id)
      : supabase.from('lyrics').delete().eq('id', selectedLyric.id);

    const { error } = await op;
    if (!error) {
      setPendingLyrics(pendingLyrics.filter(l => l.id !== selectedLyric.id));
      setSelectedLyric(null);
      setEditedLyric(null);
      setMessage(actionType === 'approve' ? '✓ Track published to library' : '✕ Submission discarded');
      setTimeout(() => setMessage(''), 4000);
    }
    setShowConfirm(false);
    setLoading(false);
  };

  const extractYTId = (url) => url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  const set = (field) => (e) => setEditedLyric({ ...editedLyric, [field]: e.target.value });

  return (
    <div className={styles.wrapper}>
      {message && <div className={styles.toast}>{message}</div>}

      <div className={styles.layout}>

        {/* ── Queue Sidebar ── */}
        <aside className={styles.queue}>
          <div className={styles.queueHeader}>
            <FaLayerGroup />
            <span>Pending Queue</span>
            <span className={styles.queueBadge}>{pendingLyrics.length}</span>
          </div>
          <div className={styles.queueList}>
            {pendingLyrics.length === 0 ? (
              <p className={styles.queueEmpty}>Queue is clear</p>
            ) : pendingLyrics.map((lyric) => (
              <div
                key={lyric.id}
                className={`${styles.queueItem} ${selectedLyric?.id === lyric.id ? styles.queueItemActive : ''}`}
                onClick={() => { setSelectedLyric(lyric); setEditedLyric({ ...lyric }); }}
              >
                <img
                  src={lyric.thumbnail_url || '/logo/logo.webp'}
                  alt=""
                  className={styles.queueThumb}
                />
                <div className={styles.queueMeta}>
                  <p className={styles.queueTitle}>{lyric.title}</p>
                  <p className={styles.queueArtist}>{lyric.artist}</p>
                </div>
                <span className={styles.pendingDot} />
              </div>
            ))}
          </div>
        </aside>

        {/* ── Inspector / Empty ── */}
        {selectedLyric && editedLyric ? (
          <div className={styles.inspector}>
            <div className={styles.inspectorScroll}>

              <div className={styles.inspectorTitle}>
                <FaEdit /> Review Inspector — {editedLyric.title}
              </div>

              {/* Video */}
              <div className={styles.videoWrap}>
                {editedLyric.music_url && extractYTId(editedLyric.music_url) ? (
                  <iframe
                    className={styles.videoEmbed}
                    src={`https://www.youtube.com/embed/${extractYTId(editedLyric.music_url)}`}
                    title="Preview"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <div className={styles.noVideo}>
                    <FaYoutube className={styles.noVideoIcon} />
                    <span>No video URL provided</span>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}><FaEdit className={styles.labelIcon} /> Title</label>
                  <input className={styles.input} type="text" value={editedLyric.title || ''} onChange={set('title')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaUserEdit className={styles.labelIcon} /> Artist</label>
                  <input className={styles.input} type="text" value={editedLyric.artist || ''} onChange={set('artist')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaGlobe className={styles.labelIcon} /> Language</label>
                  <input className={styles.input} type="text" value={editedLyric.language || ''} onChange={set('language')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaCalendarAlt className={styles.labelIcon} /> Release Date</label>
                  <input className={styles.input} type="date" value={editedLyric.published_date || ''} onChange={set('published_date')} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}><FaYoutube className={styles.labelIcon} /> YouTube URL</label>
                  <input className={styles.input} type="text" value={editedLyric.music_url || ''} onChange={set('music_url')} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}><FaFileAlt className={styles.labelIcon} /> Lyrics</label>
                  <textarea
                    className={styles.textarea}
                    rows={10}
                    value={editedLyric.lyrics || ''}
                    onChange={set('lyrics')}
                  />
                </div>
              </div>

            </div>

            {/* Action footer */}
            <div className={styles.actionFooter}>
              <button
                className={styles.btnDiscard}
                onClick={() => { setActionType('reject'); setShowConfirm(true); }}
              >
                <FaTimes /> Discard
              </button>
              <button
                className={styles.btnApprove}
                disabled={loading}
                onClick={() => { setActionType('approve'); setShowConfirm(true); }}
              >
                <FaCheck /> Confirm &amp; Publish
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            {pendingLyrics.length === 0 ? (
              <>
                <FaCheck className={styles.allClearIcon} style={{ fontSize: 40, opacity: 0.15 }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text2)', margin: 0 }}>
                  All clear
                </h3>
                <p>No submissions pending review</p>
              </>
            ) : (
              <>
                <FaLayerGroup className={styles.emptyIcon} />
                <p>Select a track to begin review</p>
              </>
            )}
          </div>
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

export default ApproveLyrics;