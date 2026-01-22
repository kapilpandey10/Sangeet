import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaTrash, FaPlus, FaLayerGroup, FaYoutube, 
  FaPenNib, FaLanguage, FaCalendarAlt, FaUserEdit 
} from 'react-icons/fa'; 
import styles from './style/AddLyrics.module.css';

const AddLyrics = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [artists, setArtists] = useState([{ name: '', suggestions: [] }]);
  const [writer, setWriter] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [message, setMessage] = useState('');
  const [addedBy, setAddedBy] = useState('Admin');
  const [language, setLanguage] = useState('Nepali');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    document.title = 'Command: Add Lyrics | Contributor Studio';
  }, []);

  const generateSlug = (t) => t.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const getYouTubeVideoID = (url) => {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] || (url.length === 11 ? url : null);
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    const videoId = getYouTubeVideoID(url);
    if (videoId) {
      setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      setVideoError('');
    } else {
      setThumbnail('');
      setVideoError('Invalid URL');
    }
  };

  const handleArtistChange = async (index, event) => {
    const updated = [...artists];
    const val = event.target.value;
    updated[index].name = val;
    if (val.length > 1) {
      const { data } = await supabase.from('lyrics').select('artist').ilike('artist', `%${val}%`).limit(5);
      updated[index].suggestions = data ? [...new Set(data.map(l => l.artist))] : [];
    }
    setArtists(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const videoId = getYouTubeVideoID(videoUrl);
    if (!videoId) return setVideoError('Valid YouTube URL required');

    try {
      const { error } = await supabase.from('lyrics').insert([{
        title,
        slug: slug || generateSlug(title),
        artist: artists.map(a => a.name).join(', '),
        lyrics_writer: writer,
        lyrics,
        english_lyrics: englishLyrics,
        published_date: `${releaseYear}-01-01`,
        music_url: `https://www.youtube.com/watch?v=${videoId}`,
        status: 'pending',
        added_by: addedBy,
        language,
        description,
        thumbnail_url: thumbnail
      }]);

      if (error) throw error;
      setMessage('Submission Live for Review');
      // Reset logic preserved
      setTitle(''); setSlug(''); setArtists([{ name: '', suggestions: [] }]);
      setLyrics(''); setEnglishLyrics(''); setVideoUrl('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className={styles.studioContainer}>
      {message && <div className={styles.noirToast}>{message}</div>}
      
      <form onSubmit={handleSubmit} className={styles.studioLayout}>
        {/* LEFT: METADATA PANEL */}
        <aside className={styles.metaPanel}>
          <div className={styles.panelHeader}>
            <FaLayerGroup color="#ff00ff" /> <span>Metadata Inspector</span>
          </div>
          
          <div className={styles.fieldGrid}>
            <div className={styles.fieldBox}>
              <label>Track Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className={styles.fieldBox}>
              <label>Custom Slug</label>
              <input type="text" value={slug} placeholder="Auto-generated if empty" onChange={(e) => setSlug(e.target.value)} />
            </div>

            <div className={styles.fieldBoxFull}>
              <label>Singers / Artists</label>
              {artists.map((artist, index) => (
                <div key={index} className={styles.artistRow}>
                  <input type="text" value={artist.name} onChange={(e) => handleArtistChange(index, e)} required />
                  {index > 0 && <button type="button" onClick={() => setArtists(artists.filter((_, i) => i !== index))}><FaTrash /></button>}
                </div>
              ))}
              <button type="button" className={styles.btnAdd} onClick={() => setArtists([...artists, { name: '', suggestions: [] }])}>
                <FaPlus /> Add Artist
              </button>
            </div>

            <div className={styles.fieldBox}>
              <label><FaPenNib /> Writer</label>
              <input type="text" value={writer} onChange={(e) => setWriter(e.target.value)} required />
            </div>

            <div className={styles.fieldBox}>
              <label><FaCalendarAlt /> Year</label>
              <input type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} required />
            </div>

            <div className={styles.fieldBox}>
              <label><FaLanguage /> Language</label>
              <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} required />
            </div>

            <div className={styles.fieldBox}>
              <label><FaUserEdit /> Added By</label>
              <input list="adminList" value={addedBy} onChange={(e) => setAddedBy(e.target.value)} required />
              <datalist id="adminList"><option value="Admin"/><option value="Ashish Khanal (Mr. Thule)"/></datalist>
            </div>
          </div>
        </aside>

        {/* RIGHT: CONTENT & PREVIEW */}
        <section className={styles.contentPanel}>
          <div className={styles.monitorArea}>
            {thumbnail ? (
              <div className={styles.previewFrame}>
                <img src={thumbnail} alt="Preview" />
                <div className={styles.ytBadge}><FaYoutube /> Live Link Sync</div>
              </div>
            ) : (
              <div className={styles.emptyMonitor}>Monitor Offline: Waiting for YouTube URL</div>
            )}
            <input 
              type="text" 
              className={styles.ytInput} 
              placeholder="Paste YouTube Link or Video ID" 
              value={videoUrl} 
              onChange={handleVideoUrlChange} 
            />
          </div>

          <div className={styles.lyricsGrid}>
            <div className={styles.textContainer}>
              <label>Original Lyrics</label>
              <textarea className={styles.noirTextarea} rows={12} value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
            </div>
            <div className={styles.textContainer}>
              <label>English Translation</label>
              <textarea className={styles.noirTextarea} rows={12} value={englishLyrics} onChange={(e) => setEnglishLyrics(e.target.value)} />
            </div>
          </div>

          <footer className={styles.actionCenter}>
             <button type="submit" className={styles.publishBtn}>Initialize & Publish Track</button>
          </footer>
        </section>
      </form>
    </div>
  );
};

export default AddLyrics;