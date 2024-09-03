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

  useEffect(() => {
    const fetchLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*');

      if (error) {
        console.error('Error fetching lyrics:', error);
      } else {
        setLyrics(data);
      }
    };

    fetchLyrics();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lyric:', error);
    } else {
      setLyrics(lyrics.filter((lyric) => lyric.id !== id));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { id, title, artist, lyrics, published_date, music_url } = editLyric;
    const { error } = await supabase
      .from('lyrics')
      .update({ title, artist, lyrics, published_date, music_url })
      .eq('id', id);

    if (error) {
      console.error('Error updating lyric:', error);
    } else {
      setLyrics(lyrics.map((lyric) => (lyric.id === id ? editLyric : lyric)));
      setEditLyric(null); // Close the edit form after update
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
      {lyrics.length > 0 ? (
        <ul>
          {lyrics.map((lyric) => (
            <li key={lyric.id}>
              <h3>{lyric.title}</h3>
              <p><strong>Artist:</strong> {lyric.artist}</p>
              <button onClick={() => handleEditClick(lyric)}>Update</button>
              <button onClick={() => handleDelete(lyric.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lyrics available.</p>
      )}

      {editLyric && (
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
              Lyrics:
              <textarea
                name="lyrics"
                value={editLyric.lyrics}
                onChange={handleChange}
                required
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
                value={editLyric.music_url}
                onChange={handleChange}
              />
            </label>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditLyric(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageLyrics;
