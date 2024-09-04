import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/AddLyrics.css';
import { FaTrash, FaPlus } from 'react-icons/fa'; // Import icons for adding/removing

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddLyrics = () => {
  const [title, setTitle] = useState('');
  const [artists, setArtists] = useState([{ name: '', suggestions: [] }]); // For multiple artists
  const [writer, setWriter] = useState(''); // Lyrics writer
  const [writerSuggestions, setWriterSuggestions] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [videoId, setVideoId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = "Add Song Lyrics | Contribute to Sangeet Lyrics Central";

    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    metaDescription.content = "Contribute to Sangeet Lyrics Central by adding new song lyrics. Fill in details such as title, artist, release year, and an optional YouTube video ID. Join our community of music lovers and share your favorite lyrics today.";
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = "keywords";
    metaKeywords.content = "add lyrics, submit lyrics, song lyrics, Sangeet Lyrics Central, music lyrics, contribute lyrics, add new song, YouTube lyrics";
    document.head.appendChild(metaKeywords);

    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
    };
  }, []);

  // Function to handle adding a new artist input field
  const addArtist = () => {
    setArtists([...artists, { name: '', suggestions: [] }]);
  };

  // Function to handle removing an artist input field
  const removeArtist = (index) => {
    const updatedArtists = [...artists];
    updatedArtists.splice(index, 1);
    setArtists(updatedArtists);
  };

  // Fetch artist suggestions from the lyrics table
  const handleArtistChange = async (index, event) => {
    const updatedArtists = [...artists];
    updatedArtists[index].name = event.target.value;
    setArtists(updatedArtists);

    // Query the `lyrics` table for unique artist names
    const { data, error } = await supabase
      .from('lyrics')
      .select('artist')
      .ilike('artist', `%${event.target.value}%`)
      .limit(5);

    if (!error) {
      const uniqueArtists = [...new Set(data.map(lyric => lyric.artist))];
      updatedArtists[index].suggestions = uniqueArtists;
      setArtists(updatedArtists);
    }
  };

  const selectArtistSuggestion = (index, suggestion) => {
    const updatedArtists = [...artists];
    updatedArtists[index].name = suggestion;
    updatedArtists[index].suggestions = []; // Clear suggestions after selecting
    setArtists(updatedArtists);
  };

  // Fetch lyrics writer suggestions from the lyrics table
  const handleWriterChange = async (event) => {
    setWriter(event.target.value);

    // Query the `lyrics` table for unique lyrics writer names
    const { data, error } = await supabase
      .from('lyrics')
      .select('lyrics_writer')
      .ilike('lyrics_writer', `%${event.target.value}%`)
      .limit(5);

    if (!error) {
      const uniqueWriters = [...new Set(data.map(lyric => lyric.lyrics_writer))];
      setWriterSuggestions(uniqueWriters);
    }
  };

  const selectWriterSuggestion = (suggestion) => {
    setWriter(suggestion);
    setWriterSuggestions([]); // Clear suggestions after selecting
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('lyrics')
        .insert([
          {
            title,
            artist: artists.map(artist => artist.name).join(', '), // Store artists as a comma-separated string
            lyrics_writer: writer, // Add lyrics writer
            lyrics,
            published_date: `${releaseYear}-01-01`, // Store the year with a default month and day
            music_url: videoId ? `https://www.youtube.com/embed/${videoId}` : null, // Construct full URL or null if empty
            status: 'pending' // Set the status to pending
          }
        ]);

      if (error) throw error;

      setMessage('Lyrics submitted successfully! It will be reviewed by the admin and listed soon.');

      // Reset the form
      setTitle('');
      setArtists([{ name: '', suggestions: [] }]);
      setWriter('');
      setLyrics('');
      setReleaseYear('');
      setVideoId('');

      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      setMessage('An error occurred while adding lyrics: ' + error.message);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="add-lyrics-container">
      <h1>Add New Lyrics</h1>
      {message && <p className="submission-message">{message}</p>}
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
          <label htmlFor="artists">Artists</label>
          {artists.map((artist, index) => (
            <div key={index} className="artist-input">
              <input
                type="text"
                value={artist.name}
                onChange={(e) => handleArtistChange(index, e)}
                required
                placeholder="Enter artist name"
              />
              {index > 0 && (
                <button type="button" onClick={() => removeArtist(index)}>
                  <FaTrash />
                </button>
              )}

              {/* Show artist suggestions */}
              {artist.suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {artist.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      onClick={() => selectArtistSuggestion(index, suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <button type="button" onClick={addArtist} className="add-artist-button">
            <FaPlus /> Add another artist
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="writer">Lyrics Writer</label>
          <input
            type="text"
            id="writer"
            value={writer}
            onChange={handleWriterChange}
            required
          />
          {/* Show writer suggestions */}
          {writerSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {writerSuggestions.map((suggestion, i) => (
                <li key={i} onClick={() => selectWriterSuggestion(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lyrics">Lyrics</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={10} // Make the text box larger
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
            min="1800"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="videoId">YT Video ID (Optional)</label>
          <input
            type="text"
            id="videoId"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="VIDEO-ID-HERE"
          />
          <small>Example: https://www.youtube.com/embed/{videoId || 'VIDEO-ID-HERE'}</small>
        </div>

        <button type="submit">Submit Lyrics</button>
      </form>
    </div>
  );
};

export default AddLyrics;
