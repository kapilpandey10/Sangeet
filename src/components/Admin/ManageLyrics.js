import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import ConfirmMsg from '../ConfirmMsg'; // Import the confirmation modal
import './style/ManageLyrics.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

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
        setFilteredLyrics(data || []); // Initial filtered lyrics
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

      // Update the lyrics state
      setLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== id));
      setFilteredLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== id));
      setMessageType('success');
      setMessage('Lyrics deleted successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to delete the lyrics. Please try again.');
    } finally {
      setShowConfirm(false); // Close the modal after deletion
    }
  };

  // Handle update functionality
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, title, artist, lyrics, lyrics_writer, published_date, music_url, added_by } = editLyric;
      const { error } = await supabase
        .from('lyrics')
        .update({ title, artist, lyrics, lyrics_writer, published_date, music_url, added_by })
        .eq('id', id);

      if (error) throw error;

      // Update lyrics list
      setLyrics((prevLyrics) =>
        prevLyrics.map((lyric) => (lyric.id === id ? editLyric : lyric))
      );
      setFilteredLyrics((prevLyrics) =>
        prevLyrics.map((lyric) => (lyric.id === id ? editLyric : lyric))
      );
      setEditLyric(null); // Close the editing form
      setMessageType('success');
      setMessage('Lyrics updated successfully!');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to update the lyrics. Please try again.');
    }
  };

  // Handle edit button click
  const handleEditClick = (lyric) => {
    setEditLyric(lyric);
  };

  // Handle delete button click
  const handleDeleteClick = (lyric) => {
    setLyricToDelete(lyric); // Set the lyric to delete
    setShowConfirm(true); // Show the confirmation modal
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (lyricToDelete) {
      handleDelete(lyricToDelete.id); // Proceed with deletion
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowConfirm(false); // Close modal without deleting
    setLyricToDelete(null); // Reset lyric to delete
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditLyric({ ...editLyric, [name]: value });
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
    <div className="manage-lyrics-container">
      <h2>Manage Lyrics</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by title, artist, lyrics, or added by..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-box"
      />

      {/* Show the number of filtered results */}
      <p>{filteredLyrics.length} {filteredLyrics.length === 1 ? 'result' : 'results'} found</p>

      {/* Display success/error messages */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Display Lyrics List */}
      {filteredLyrics.length > 0 ? (
        <ul className="lyrics-list">
          {filteredLyrics.map((lyric) => (
            <li key={lyric.id} className="lyrics-item">
              <div className="lyrics-item-content">
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <p><strong>Writer:</strong> {lyric.lyrics_writer || 'N/A'}</p>
                <p><strong>Added By:</strong> {lyric.added_by || 'N/A'}</p>
              </div>
              <div className="icon-buttons">
                <button onClick={() => handleEditClick(lyric)} className="icon-button">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteClick(lyric)} className="icon-button delete-button">
                  <FaTrashAlt />
                </button>
              </div>

              {/* Display Edit Form */}
              {editLyric && editLyric.id === lyric.id && (
                <div className="edit-lyric-form">
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
                        required
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
                    <div className="form-actions">
                      <button type="submit" className="icon-button save-button">
                        <FaSave />
                      </button>
                      <button type="button" onClick={() => setEditLyric(null)} className="icon-button cancel-button">
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
          show={showConfirm}  // Determines whether to show the modal
          onConfirm={handleConfirmDelete}  // Function to execute if the user confirms deletion
          onCancel={handleCancelDelete}  // Function to execute if the user cancels deletion
          message="Are you sure you want to delete this lyric?" // Custom message in the modal 
        /> )}
    </div> 
  );
};

export default ManageLyrics;
