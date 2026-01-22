import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ConfirmMsg from '../../components/ConfirmMsg';
import { 
  FaYoutube, FaEdit, FaCheck, FaTimes, FaUser, 
  FaGlobe, FaCalendarAlt, FaLayerGroup, FaFileAlt 
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
    const fetchPendingLyrics = async () => {
      const { data, error } = await supabase.from('lyrics').select('*').eq('status', 'pending');
      if (!error) setPendingLyrics(data);
    };
    fetchPendingLyrics();
  }, []);

  const handleConfirmAction = async () => {
    setLoading(true);
    const tableUpdate = actionType === 'approve' 
      ? supabase.from('lyrics').update({ ...editedLyric, status: 'approved' }).eq('id', selectedLyric.id)
      : supabase.from('lyrics').delete().eq('id', selectedLyric.id);

    const { error } = await tableUpdate;
    if (!error) {
      setPendingLyrics(pendingLyrics.filter(l => l.id !== selectedLyric.id));
      setSelectedLyric(null);
      setMessage(actionType === 'approve' ? 'Review Finalized' : 'Submission Discarded');
    }
    setShowConfirm(false);
    setLoading(false);
  };

  const extractYouTubeId = (url) => url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  return (
    <div className={styles.commandContainer}>
      {message && <div className={styles.toast}>{message}</div>}
      
      <div className={styles.studioLayout}>
        {/* LEFT: MINIMALIST QUEUE */}
        <aside className={styles.sidebarQueue}>
          <div className={styles.queueHeader}>
            <FaLayerGroup /> <span>Pending Queue</span>
            <div className={styles.badge}>{pendingLyrics.length}</div>
          </div>
          <div className={styles.scrollList}>
            {pendingLyrics.map((lyric) => (
              <div 
                key={lyric.id} 
                className={`${styles.queueItem} ${selectedLyric?.id === lyric.id ? styles.active : ''}`}
                onClick={() => { setSelectedLyric(lyric); setEditedLyric({ ...lyric }); }}
              >
                <img src={lyric.thumbnail_url || '/logo/logo.webp'} alt="" className={styles.miniThumb} />
                <div className={styles.itemMeta}>
                  <h4>{lyric.title}</h4>
                  <p>{lyric.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT: OBSIDIAN REVIEW TOOLS */}
        {selectedLyric ? (
          <div className={styles.inspectorPanel}>
            <div className={styles.toolScroll}>
              <div className={styles.previewSection}>
                {editedLyric.music_url && extractYouTubeId(editedLyric.music_url) ? (
                  <div className={styles.videoFrame}>
                    <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(editedLyric.music_url)}`} title="Preview" frameBorder="0" allowFullScreen />
                  </div>
                ) : (
                  <div className={styles.noVideo}>No Video Provided</div>
                )}
              </div>

              <div className={styles.editorGrid}>
                <div className={styles.inputCard}>
                  <label><FaEdit /> Metadata</label>
                  <input type="text" placeholder="Song Title" value={editedLyric.title} onChange={(e) => setEditedLyric({...editedLyric, title: e.target.value})} />
                  <input type="text" placeholder="Artist" value={editedLyric.artist} onChange={(e) => setEditedLyric({...editedLyric, artist: e.target.value})} />
                  <div className={styles.row}>
                    <input type="text" placeholder="Language" value={editedLyric.language} onChange={(e) => setEditedLyric({...editedLyric, language: e.target.value})} />
                    <input type="text" placeholder="YouTube URL" value={editedLyric.music_url} onChange={(e) => setEditedLyric({...editedLyric, music_url: e.target.value})} />
                  </div>
                </div>

                <div className={styles.lyricsCard}>
                  <label><FaFileAlt /> Lyrics Content</label>
                  <textarea rows={10} value={editedLyric.lyrics} onChange={(e) => setEditedLyric({...editedLyric, lyrics: e.target.value})} />
                </div>
              </div>
            </div>

            <footer className={styles.actionCenter}>
              <button className={styles.discardBtn} onClick={() => { setActionType('reject'); setShowConfirm(true); }}>
                <FaTimes /> Discard
              </button>
              <button className={styles.approveBtn} onClick={() => { setActionType('approve'); setShowConfirm(true); }}>
                <FaCheck /> Confirm & Publish
              </button>
            </footer>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FaLayerGroup size={40} />
            <p>Select a track to begin review</p>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={handleConfirmAction}
          onCancel={() => setShowConfirm(false)}
          message={`Finalize review for ${selectedLyric.title}?`}
        />
      )}
    </div>
  );
};

export default ApproveLyrics;