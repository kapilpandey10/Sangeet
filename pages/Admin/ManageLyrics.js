import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaEdit, FaTrashAlt, FaSave, FaTimes, FaSearch, FaEye, FaEyeSlash,
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

  // 1. Fetch both Public (approved) and Private lyrics
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
      } catch (error) {
        console.error('Error fetching library:', error);
      }
    };
    fetchLyrics();
  }, []);

  // 2. High-Performance Search Logic
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = lyrics.filter(l => 
      l.title.toLowerCase().includes(query) || 
      l.artist.toLowerCase().includes(query) ||
      (l.added_by && l.added_by.toLowerCase().includes(query))
    );
    setFilteredLyrics(filtered);
  };

  // 3. YouTube ID Extractor helper
  const extractYTId = (url) => url?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];

  // 4. Handle Save for ALL fields including Status
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('lyrics')
      .update({
        title: editLyric.title,
        artist: editLyric.artist,
        lyrics: editLyric.lyrics,
        lyrics_writer: editLyric.lyrics_writer,
        published_date: editLyric.published_date,
        music_url: editLyric.music_url,
        thumbnail_url: editLyric.thumbnail_url,
        added_by: editLyric.added_by,
        status: editLyric.status // Public/Private Toggle state
      })
      .eq('id', editLyric.id);

    if (!error) {
      setLyrics(lyrics.map(l => l.id === editLyric.id ? editLyric : l));
      setFilteredLyrics(filteredLyrics.map(l => l.id === editLyric.id ? editLyric : l));
      setMessage(`Successfully Updated: ${editLyric.title}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className={styles.studioContainer}>
      {message && <div className={styles.noirToast}>{message}</div>}
      
      <header className={styles.studioHeader}>
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search live & private tracks..." 
            className={styles.noirSearch} 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className={styles.libraryCount}>
          <FaLayerGroup /> <span>{filteredLyrics.length} Tracks in Library</span>
        </div>
      </header>

      <div className={styles.studioMain}>
        {/* LEFT: SCROLLABLE LIBRARY LIST */}
        <aside className={styles.librarySidebar}>
          {filteredLyrics.map((lyric) => (
            <div 
              key={lyric.id} 
              className={`${styles.trackCard} ${editLyric?.id === lyric.id ? styles.trackActive : ''}`}
              onClick={() => setEditLyric({ ...lyric })}
            >
              <img src={lyric.thumbnail_url || '/logo/logo.webp'} alt="" className={styles.trackThumb} />
              <div className={styles.trackInfo}>
                <h4>{lyric.title}</h4>
                <p>{lyric.artist}</p>
                {lyric.status === 'private' && <span className={styles.privateLabel}>Private</span>}
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT: FULL STUDIO INSPECTOR */}
        <section className={styles.inspectorPanel}>
          {editLyric ? (
            <form className={styles.metaForm} onSubmit={handleUpdate}>
              <div className={styles.inspectorHeader}>
                <h3>Studio Inspector</h3>
                <div className={styles.inspectorActions}>
                  {/* Status Toggle Button */}
                  <button 
                    type="button" 
                    className={editLyric.status === 'approved' ? styles.btnPublic : styles.btnPrivate}
                    onClick={() => setEditLyric({
                      ...editLyric, 
                      status: editLyric.status === 'approved' ? 'private' : 'approved'
                    })}
                  >
                    {editLyric.status === 'approved' ? <><FaEye /> Public</> : <><FaEyeSlash /> Private</>}
                  </button>

                  <button type="button" className={styles.btnDelete} onClick={() => { setLyricToDelete(editLyric); setShowConfirm(true); }}>
                    <FaTrashAlt />
                  </button>
                  <button type="submit" className={styles.btnSave}><FaSave /> Save Changes</button>
                </div>
              </div>

              <div className={styles.scrollFields}>
                {/* Visual Monitor Area */}
                <div className={styles.videoPreviewArea}>
                  {editLyric.music_url && extractYTId(editLyric.music_url) ? (
                    <iframe 
                       src={`https://www.youtube.com/embed/${extractYTId(editLyric.music_url)}`} 
                       title="Studio Monitor" 
                       frameBorder="0" 
                       allowFullScreen 
                    />
                  ) : (
                    <div className={styles.noPreview}>Waiting for Valid Music URL...</div>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldBox}>
                    <label><FaEdit /> Track Title</label>
                    <input type="text" value={editLyric.title} onChange={(e) => setEditLyric({...editLyric, title: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaUserEdit /> Main Artist</label>
                    <input type="text" value={editLyric.artist} onChange={(e) => setEditLyric({...editLyric, artist: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaPenNib /> Lyrics Writer</label>
                    <input type="text" value={editLyric.lyrics_writer || ''} onChange={(e) => setEditLyric({...editLyric, lyrics_writer: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaCalendarAlt /> Release Date</label>
                    <input type="date" value={editLyric.published_date} onChange={(e) => setEditLyric({...editLyric, published_date: e.target.value})} />
                  </div>
                  <div className={styles.fieldFull}>
                    <label><FaYoutube /> YouTube Music URL</label>
                    <input type="text" value={editLyric.music_url || ''} onChange={(e) => setEditLyric({...editLyric, music_url: e.target.value})} />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>Lyrics Body</label>
                    <textarea 
                      className={styles.noirTextarea} 
                      rows={12} 
                      value={editLyric.lyrics} 
                      onChange={(e) => setEditLyric({...editLyric, lyrics: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className={styles.emptyInspector}>
               <FaLayerGroup size={50} />
               <p>Select a track from the library to update</p>
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
          message={`Are you sure you want to permanently delete "${lyricToDelete?.title}"?`}
        />
      )}
    </div>
  );
};

export default ManageLyrics;