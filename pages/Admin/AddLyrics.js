import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FaTrash, FaPlus, FaLayerGroup, FaYoutube,
  FaPenNib, FaLanguage, FaCalendarAlt, FaUserEdit, FaSearch
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

  const generateSlug = (t) =>
    t.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

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
      setVideoError('Invalid YouTube URL or ID');
    }
  };

  const handleArtistChange = async (index, event) => {
    const updated = [...artists];
    const val = event.target.value;
    updated[index].name = val;
    if (val.length > 1) {
      const { data } = await supabase.from('lyrics').select('artist').ilike('artist', `%${val}%`).limit(5);
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
      setMessage('✓ Track queued for review');
      setTitle(''); setSlug(''); setArtists([{ name: '', suggestions: [] }]);
      setLyrics(''); setEnglishLyrics(''); setVideoUrl(''); setThumbnail('');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      {message && (
        <div className={`${styles.toast} ${message.startsWith('Error') ? styles.toastError : styles.toastSuccess}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.layout}>

        {/* ── LEFT: METADATA ── */}
        <aside className={styles.metaPanel}>
          <div className={styles.panelTitle}>
            <FaLayerGroup className={styles.panelIcon} />
            <span>Track Metadata</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Track Title</label>
            <input className={styles.input} type="text" value={title}
              onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Timi Nai Ho" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Custom Slug</label>
            <input className={styles.input} type="text" value={slug}
              placeholder="auto-generated if empty" onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Singers / Artists</label>
            {artists.map((artist, index) => (
              <div key={index} className={styles.artistGroup}>
                <div className={styles.artistRow}>
                  <input className={styles.input} type="text" value={artist.name}
                    onChange={(e) => handleArtistChange(index, e)} required placeholder="Artist name" />
                  {index > 0 && (
                    <button type="button" className={styles.iconBtn}
                      onClick={() => setArtists(artists.filter((_, i) => i !== index))}>
                      <FaTrash />
                    </button>
                  )}
                </div>
                {artist.suggestions.length > 0 && (
                  <ul className={styles.suggestions}>
                    {artist.suggestions.map((s, i) => (
                      <li key={i} onClick={() => selectArtist(index, s)}>
                        <FaSearch size={9} /> {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <button type="button" className={styles.addArtistBtn}
              onClick={() => setArtists([...artists, { name: '', suggestions: [] }])}>
              <FaPlus /> Add Artist
            </button>
          </div>

          <div className={styles.fieldGrid2}>
            <div className={styles.field}>
              <label className={styles.label}><FaPenNib className={styles.labelIcon} /> Writer</label>
              <input className={styles.input} type="text" value={writer}
                onChange={(e) => setWriter(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}><FaCalendarAlt className={styles.labelIcon} /> Year</label>
              <input className={styles.input} type="number" min="1900"
                max={new Date().getFullYear()} value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}><FaLanguage className={styles.labelIcon} /> Language</label>
              <input className={styles.input} type="text" value={language}
                onChange={(e) => setLanguage(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}><FaUserEdit className={styles.labelIcon} /> Added By</label>
              <input className={styles.input} list="adminList" value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)} required />
              <datalist id="adminList">
                <option value="Admin" />
                <option value="Ashish Khanal (Mr. Thule)" />
              </datalist>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: CONTENT ── */}
        <section className={styles.contentPanel}>

          {/* YouTube preview */}
          <div className={styles.monitor}>
            <div className={styles.monitorScreen}>
              {thumbnail
                ? <img src={thumbnail} alt="Preview" className={styles.thumbImg} />
                : <div className={styles.offlineScreen}>
                    <FaYoutube className={styles.offlineIcon} />
                    <span>Awaiting sync</span>
                  </div>
              }
            </div>
            <div className={styles.ytInputWrap}>
              <FaYoutube className={styles.ytIcon} />
              <input className={styles.ytInput} type="text"
                placeholder="Paste YouTube URL or video ID"
                value={videoUrl} onChange={handleVideoUrlChange} />
            </div>
            {videoError && <p className={styles.error}>{videoError}</p>}
          </div>

          {/* Lyrics side by side */}
          <div className={styles.lyricsRow}>
            <div className={styles.lyricsBox}>
              <label className={styles.lyricsLabel}>Original Lyrics</label>
              <textarea className={styles.textarea} rows={14} value={lyrics}
                onChange={(e) => setLyrics(e.target.value)} placeholder="Paste original lyrics here..." />
            </div>
            <div className={styles.lyricsBox}>
              <label className={styles.lyricsLabel}>English Translation</label>
              <textarea className={styles.textarea} rows={14} value={englishLyrics}
                onChange={(e) => setEnglishLyrics(e.target.value)} placeholder="English version (optional)..." />
            </div>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.lyricsLabel}>Track Description</label>
            <textarea className={styles.textarea} rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short insight about the track..." />
          </div>

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitBtn}>
              Finalize &amp; Submit to Library
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default AddLyrics;