import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/ManageLyrics.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ManageLyrics = () => {
  const [lyrics, setLyrics] = useState([]);
  const [editLyric, setEditLyric] = useState(null);
  const [message, setMessage] = useState(''); // New state for success/error messages
  const [messageType, setMessageType] = useState(''); // To distinguish between success and error

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data, error } = await supabase.from('lyrics').select('*');
        if (error) throw error;
        setLyrics(data || []); // Ensure data is an array
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLyrics([]); // Set to empty array on error
      }
    };
    fetchLyrics();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('lyrics').delete().eq('id', id);
      if (error) throw error;

      // Filter out deleted lyric
      setLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== id));
      setMessageType('success');
      setMessage('Lyrics deleted successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to delete the lyrics. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, title, artist, lyrics, lyrics_writer, published_date, music_url } = editLyric;
      const { error } = await supabase
        .from('lyrics')
        .update({ title, artist, lyrics, lyrics_writer, published_date, music_url })
        .eq('id', id);

      if (error) throw error;

      setLyrics((prevLyrics) =>
        Array.isArray(prevLyrics)
          ? prevLyrics.map((lyric) => (lyric.id === id ? editLyric : lyric))
          : []
      );
      setEditLyric(null); // Close the edit form after update

      setMessageType('success');
      setMessage('Lyrics updated successfully!');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to update the lyrics. Please try again.');
    }
  };

  const handleEditClick = (lyric) => {
    setEditLyric(lyric);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditLyric({ ...editLyric, [name]: value });
  };

  return (
    <div className="manage-lyrics-container">
      <h2>Manage Lyrics</h2>

      {/* Display success/error messages */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {lyrics.length > 0 ? (
        <ul className="lyrics-list">
          {lyrics.map((lyric) => (
            <li key={lyric.id} className="lyrics-item">
              <h3>{lyric.title}</h3>
              <p><strong>Artist:</strong> {lyric.artist}</p>
              <p><strong>Writer:</strong> {lyric.lyrics_writer || 'N/A'}</p> {/* Show the writer */}
              <button onClick={() => handleEditClick(lyric)}>Update</button>
              <button onClick={() => handleDelete(lyric.id)} className="delete-button">Delete</button>

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
                    <div className="form-actions">
                      <button type="submit" className="save-button">Save Changes</button>
                      <button type="button" onClick={() => setEditLyric(null)} className="cancel-button">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lyrics available.</p>
      )}
    </div>
  );
};

export default ManageLyrics;
