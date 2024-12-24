import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import ConfirmMsg from '../../components/ConfirmMsg';
import styles from './style/ManageLyrics.module.css';

// Access environment variables with NEXT_PUBLIC prefix for Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ManageLyrics = () => {
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editLyric, setEditLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [lyricToDelete, setLyricToDelete] = useState(null);

  // Fetch only approved lyrics from Supabase
  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('status', 'approved'); // Fetch only approved lyrics
        
        if (error) throw error;
        setLyrics(data || []);
        setFilteredLyrics(data || []);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLyrics([]);
        setFilteredLyrics([]);
      }
    };
    fetchLyrics();
  }, []);

  // Handle delete functionality
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('lyrics').delete().eq('id', id);
      if (error) throw error;

      setLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== id));
      setFilteredLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== id));
      setMessageType('success');
      setMessage('Lyrics deleted successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to delete the lyrics. Please try again.');
    } finally {
      setShowConfirm(false);
    }
  };

  // Handle update functionality
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, title, artist, lyrics, lyrics_writer, published_date, music_url, added_by, thumbnail_url } = editLyric;
      const { error } = await supabase
        .from('lyrics')
        .update({ 
          title, 
          artist, 
          lyrics, 
          lyrics_writer, 
          published_date, 
          music_url, 
          added_by, 
          thumbnail_url
        })
        .eq('id', id);

      if (error) throw error;

      setLyrics((prevLyrics) =>
        prevLyrics.map((lyric) => (lyric.id === id ? editLyric : lyric))
      );
      setFilteredLyrics((prevLyrics) =>
        prevLyrics.map((lyric) => (lyric.id === id ? editLyric : lyric))
      );
      setEditLyric(null);
      setMessageType('success');
      setMessage('Lyrics updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to update the lyrics. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle edit button click
  const handleEditClick = (lyric) => {
    setEditLyric(lyric);
  };

  // Handle delete button click
  const handleDeleteClick = (lyric) => {
    setLyricToDelete(lyric);
    setShowConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (lyricToDelete) {
      handleDelete(lyricToDelete.id);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowConfirm(false);
    setLyricToDelete(null);
  };

  // Extract YouTube video ID
  const getYouTubeVideoID = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setEditLyric((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  
    // If the music_url field changes, update the thumbnail_url automatically
    if (name === 'music_url') {
      const videoID = getYouTubeVideoID(value);
      if (videoID) {
        setEditLyric((prevState) => ({
          ...prevState,
          thumbnail_url: `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`
        }));
      } else {
        setEditLyric((prevState) => ({
          ...prevState,
          thumbnail_url: '' // Clear the thumbnail_url if video ID is invalid
        }));
      }
    }
  };
  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = lyrics.filter((lyric) => {
      return (
        lyric.title.toLowerCase().includes(query) ||
        lyric.artist.toLowerCase().includes(query) ||
        lyric.lyrics.toLowerCase().includes(query) ||
        (lyric.added_by && lyric.added_by.toLowerCase().includes(query))
      );
    });
    setFilteredLyrics(filtered);
  };

  return (
    <div className={styles.manageLyricsContainer}>
      <h2>Manage Lyrics</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by title, artist, lyrics, or added by..."
        value={searchQuery}
        onChange={handleSearch}
        className={styles.searchBox}
      />

      {/* Show the number of filtered results */}
      <p>{filteredLyrics.length} {filteredLyrics.length === 1 ? 'result' : 'results'} found</p>

      {/* Display success/error messages */}
      {message && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </div>
      )}

      {/* Display Lyrics List */}
      {filteredLyrics.length > 0 ? (
        <ul className={styles.lyricsList}>
          {filteredLyrics.map((lyric) => (
            <li key={lyric.id} className={styles.lyricsItem}>
              <div className={styles.lyricsItemContent}>
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <p><strong>Writer:</strong> {lyric.lyrics_writer || 'N/A'}</p>
                <p><strong>Added By:</strong> {lyric.added_by || 'N/A'}</p>
              </div>
              <div className={styles.iconButtons}>
                <button onClick={() => handleEditClick(lyric)} className={styles.iconButton}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteClick(lyric)} className={`${styles.iconButton} ${styles.deleteButton}`}>
                  <FaTrashAlt />
                </button>
              </div>

              {/* Display Edit Form */}
              {editLyric && editLyric.id === lyric.id && (
                <div className={styles.editLyricForm}>
                  <h2>Edit Lyric</h2>
                  <form onSubmit={handleUpdate}>
                    <label>
                      Title:
                      <input
                        type="text"
                        name="title"
                        value={editLyric.title}
                        onChange={handleChange}
                        required
                      />
                    </label>
                    <label>
                      Artist:
                      <input
                        type="text"
                        name="artist"
                        value={editLyric.artist}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Thumbnail URL:
                      <input
                        type="text"
                        name="thumbnail_url"
                        value={editLyric.thumbnail_url} 
                        onChange={handleChange}
                        required
                        readOnly
                      />
                    </label>

                    <label>
                      Lyrics Writer:
                      <input
                        type="text"
                        name="lyrics_writer"
                        value={editLyric.lyrics_writer || ''}
                        onChange={handleChange}
                      />
                    </label>
                    <label>
                      Lyrics:
                      <textarea
                        name="lyrics"
                        value={editLyric.lyrics}
                        onChange={handleChange}
                        rows={5}
                      />
                    </label>
                    <label>
                      Published Date:
                      <input
                        type="date"
                        name="published_date"
                        value={editLyric.published_date}
                        onChange={handleChange}
                        required
                      />
                    </label>
                    <label>
                      Music URL:
                      <input
                        type="text"
                        name="music_url"
                        value={editLyric.music_url || ''}
                        onChange={handleChange}
                      />
                    </label>
                    <label>
                      Added By:
                      <input
                        type="text"
                        name="added_by"
                        value={editLyric.added_by || ''}
                        onChange={handleChange}
                      />
                    </label>
                    <div className={styles.formActions}>
                      <button type="submit" className={`${styles.iconButton} ${styles.saveButton}`}>
                        <FaSave />
                      </button>
                      <button type="button" onClick={() => setEditLyric(null)} className={`${styles.iconButton} ${styles.cancelButton}`}>
                        <FaTimes />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No approved lyrics available.</p>
      )}

      {/* ConfirmMsg modal, shown only when showConfirm is true */}
      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message="Are you sure you want to delete this lyric?"
        />
      )}
    </div> 
  );
};

export default ManageLyrics;
