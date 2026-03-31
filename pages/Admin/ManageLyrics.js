import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FaEdit, FaTrashAlt, FaSave, FaSearch, FaEye, FaEyeSlash,
  FaLayerGroup, FaYoutube, FaUserEdit, FaCalendarAlt, FaPenNib
} from 'react-icons/fa';
import ConfirmMsg from '../../components/ConfirmMsg';
import styles from './style/ManageLyrics.module.css';

const ManageLyrics = () => {
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editLyric, setEditLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [lyricToDelete, setLyricToDelete] = useState(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .in('status', ['approved', 'private'])
          .order('created_at', { ascending: false });
        if (error) throw error;
        setLyrics(data || []);
        setFilteredLyrics(data || []);
      } catch (err) {
        console.error('Error fetching library:', err);
      }
    };
    fetchLyrics();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = lyrics.filter(l =>
      l.title?.toLowerCase().includes(query) ||
      l.artist?.toLowerCase().includes(query) ||
      l.added_by?.toLowerCase().includes(query)
    );
    setFilteredLyrics(filtered);
  };

  const extractYTId = (url) => url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('lyrics')
      .update({
        title:          editLyric.title,
        artist:         editLyric.artist,
        lyrics:         editLyric.lyrics,
        lyrics_writer:  editLyric.lyrics_writer,
        published_date: editLyric.published_date,
        music_url:      editLyric.music_url,
        thumbnail_url:  editLyric.thumbnail_url,
        added_by:       editLyric.added_by,
        status:         editLyric.status,
      })
      .eq('id', editLyric.id);

    if (!error) {
      const updated = (arr) => arr.map(l => l.id === editLyric.id ? editLyric : l);
      setLyrics(updated(lyrics));
      setFilteredLyrics(updated(filteredLyrics));
      setMessage(`Updated: ${editLyric.title}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className={styles.wrapper}>
      {message && <div className={styles.toast}>{message}</div>}

      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tracks, artists..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className={styles.countBadge}>
          <FaLayerGroup />
          <span>{filteredLyrics.length}</span> tracks
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* LEFT: Track list */}
        <aside className={styles.sidebar}>
          {filteredLyrics.length === 0 ? (
            <p className={styles.empty}>No tracks found</p>
          ) : filteredLyrics.map((lyric) => (
            <div
              key={lyric.id}
              className={`${styles.trackCard} ${editLyric?.id === lyric.id ? styles.trackActive : ''}`}
              onClick={() => setEditLyric({ ...lyric })}
            >
              <img
                src={lyric.thumbnail_url || '/logo/logo.webp'}
                alt=""
                className={styles.thumb}
              />
              <div className={styles.trackMeta}>
                <p className={styles.trackTitle}>{lyric.title}</p>
                <p className={styles.trackArtist}>{lyric.artist}</p>
                {lyric.status === 'private' && (
                  <span className={styles.privatePill}>Private</span>
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT: Inspector */}
        <section className={styles.inspector}>
          {editLyric ? (
            <form className={styles.inspectorForm} onSubmit={handleUpdate}>

              <div className={styles.inspectorTop}>
                <div className={styles.inspectorTitle}>
                  <FaEdit /> Studio Inspector
                </div>
                <div className={styles.inspectorActions}>
                  <button
                    type="button"
                    className={editLyric.status === 'approved' ? styles.btnPublic : styles.btnPrivate}
                    onClick={() => setEditLyric({
                      ...editLyric,
                      status: editLyric.status === 'approved' ? 'private' : 'approved'
                    })}
                  >
                    {editLyric.status === 'approved'
                      ? <><FaEye /> Public</>
                      : <><FaEyeSlash /> Private</>
                    }
                  </button>
                  <button
                    type="button"
                    className={styles.btnDelete}
                    onClick={() => { setLyricToDelete(editLyric); setShowConfirm(true); }}
                  >
                    <FaTrashAlt />
                  </button>
                  <button type="submit" className={styles.btnSave}>
                    <FaSave /> Save
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              <div className={styles.videoWrap}>
                {editLyric.music_url && extractYTId(editLyric.music_url) ? (
                  <iframe
                    className={styles.videoEmbed}
                    src={`https://www.youtube.com/embed/${extractYTId(editLyric.music_url)}`}
                    title="Preview"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <div className={styles.noVideo}>
                    <FaYoutube className={styles.noVideoIcon} />
                    <span>No valid URL</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}><FaEdit className={styles.li} /> Title</label>
                  <input className={styles.input} type="text" value={editLyric.title}
                    onChange={(e) => setEditLyric({ ...editLyric, title: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaUserEdit className={styles.li} /> Artist</label>
                  <input className={styles.input} type="text" value={editLyric.artist}
                    onChange={(e) => setEditLyric({ ...editLyric, artist: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaPenNib className={styles.li} /> Writer</label>
                  <input className={styles.input} type="text" value={editLyric.lyrics_writer || ''}
                    onChange={(e) => setEditLyric({ ...editLyric, lyrics_writer: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><FaCalendarAlt className={styles.li} /> Release Date</label>
                  <input className={styles.input} type="date" value={editLyric.published_date || ''}
                    onChange={(e) => setEditLyric({ ...editLyric, published_date: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}><FaYoutube className={styles.li} /> YouTube URL</label>
                  <input className={styles.input} type="text" value={editLyric.music_url || ''}
                    onChange={(e) => setEditLyric({ ...editLyric, music_url: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Lyrics</label>
                  <textarea className={styles.textarea} rows={12}
                    value={editLyric.lyrics || ''}
                    onChange={(e) => setEditLyric({ ...editLyric, lyrics: e.target.value })} />
                </div>
              </div>

            </form>
          ) : (
            <div className={styles.emptyInspector}>
              <FaLayerGroup className={styles.emptyIcon} />
              <p>Select a track to inspect</p>
            </div>
          )}
        </section>

      </div>

      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={async () => {
            const { error } = await supabase.from('lyrics').delete().eq('id', lyricToDelete.id);
            if (!error) {
              setLyrics(lyrics.filter(l => l.id !== lyricToDelete.id));
              setFilteredLyrics(filteredLyrics.filter(l => l.id !== lyricToDelete.id));
              setEditLyric(null);
              setShowConfirm(false);
            }
          }}
          onCancel={() => setShowConfirm(false)}
          message={`Permanently delete "${lyricToDelete?.title}"?`}
        />
      )}
    </div>
  );
};

export default ManageLyrics;