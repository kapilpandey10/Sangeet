import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/AddLyrics.css';
// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);



const AddLyrics = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [musicUrl, setMusicUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('lyrics')
        .insert([
          {
            title,
            artist,
            lyrics,
            published_date: `${releaseYear}-01-01`, // Store the year with a default month and day
            music_url: musicUrl,
            status: 'pending' // Set the status to pending
          }
        ]);

      if (error) throw error;

      console.log('Lyrics added successfully:', data);
      alert('Lyrics added successfully!');

      // Reset the form
      setTitle('');
      setArtist('');
      setLyrics('');
      setReleaseYear('');
      setMusicUrl('');
    } catch (error) {
      console.error('Error adding lyrics:', error);
      alert('An error occurred while adding lyrics: ' + error.message);
    }
  };

  return (
    <div className="add-lyrics-container">
      <h1>Add New Lyrics</h1>
      <form onSubmit={handleSubmit} className="add-lyrics-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lyrics">Lyrics</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="releaseYear">Release Year</label>
          <input
            type="number"
            id="releaseYear"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            required
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="form-group">
          <label htmlFor="musicUrl">Music URL</label>
          <input
            type="url"
            id="musicUrl"
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
          />
        </div>
        <button type="submit">Add Lyrics</button>
      </form>
    </div>
  );
};

export default AddLyrics;
