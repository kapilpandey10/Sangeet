import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/AddLyrics.css';
import { FaTrash, FaPlus } from 'react-icons/fa'; // Icons for adding/removing

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddLyrics = () => {
  const [title, setTitle] = useState('');
  const [artists, setArtists] = useState([{ name: '', suggestions: [] }]);
  const [writer, setWriter] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [videoUrl, setVideoUrl] = useState(''); // Changed from videoId to videoUrl
  const [videoError, setVideoError] = useState(''); // Error message for invalid YouTube URLs or IDs
  const [message, setMessage] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [language, setlangugae] = useState('');

  useEffect(() => {
    document.title = "Add Song Lyrics | Contribute to Sangeet Lyrics Central";
    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    metaDescription.content = "Contribute to Sangeet Lyrics Central by adding new song lyrics. Join our community of music lovers.";
    document.head.appendChild(metaDescription);

    return () => document.head.removeChild(metaDescription);
  }, []);

  // Function to validate the YouTube URL or video ID
  const validateYouTubeURL = (url) => {
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const idRegex = /^[a-zA-Z0-9_-]{11}$/;

    let videoId = null;

    if (urlRegex.test(url)) {
      // Extract video ID from full URL
      const match = url.match(urlRegex);
      videoId = match ? match[1] : null;
    } else if (idRegex.test(url)) {
      // Direct video ID entered
      videoId = url;
    } else {
      setVideoError('Please enter a valid YouTube Video URL or ID.');
      return null;
    }

    setVideoError('');
    return videoId;
  };

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
    const artistName = event.target.value;
    updatedArtists[index].name = artistName;
    setArtists(updatedArtists);

    if (artistName.length > 1) {
      const { data, error } = await supabase
        .from('lyrics')
        .select('artist')
        .ilike('artist', `%${artistName}%`)
        .limit(5);

      if (!error && data.length) {
        const uniqueArtists = [...new Set(data.map(lyric => lyric.artist))];
        updatedArtists[index].suggestions = uniqueArtists;
      } else {
        updatedArtists[index].suggestions = [];
      }
      setArtists(updatedArtists);
    } else {
      updatedArtists[index].suggestions = []; // Clear suggestions if input is too short
      setArtists(updatedArtists);
    }
  };

  const selectArtistSuggestion = (index, suggestion) => {
    const updatedArtists = [...artists];
    updatedArtists[index].name = suggestion;
    updatedArtists[index].suggestions = []; // Clear suggestions after selecting
    setArtists(updatedArtists);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalVideoId = validateYouTubeURL(videoUrl);
    if (!finalVideoId) return; // Stop submission if video ID is invalid

    try {
      const { data, error } = await supabase
        .from('lyrics')
        .insert([
          {
            title,
            artist: artists.map(artist => artist.name).join(', '),
            lyrics_writer: writer,
            lyrics,
            published_date: `${releaseYear}-01-01`,
            music_url: `https://www.youtube.com/watch?v=${finalVideoId}`,
            status: 'pending',
            added_by: addedBy,
            language:language
          }
        ]);

      if (error) throw error;

      setMessage('Lyrics submitted successfully! It will be reviewed by the admin and listed soon.');
      setTitle('');
      setArtists([{ name: '', suggestions: [] }]);
      setWriter('');
      setLyrics('');
      setReleaseYear('');
      setVideoUrl('');
      setAddedBy('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('An error occurred while adding lyrics: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
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
          <label htmlFor="artists">Singer</label>
          {artists.map((artist, index) => (
            <div key={index} className="artist-input">
              <input
                type="text"
                value={artist.name}
                onChange={(e) => handleArtistChange(index, e)}
                required
                placeholder="Enter Singer name"
              />
              {index > 0 && (
                <button type="button" onClick={() => removeArtist(index)}>
                  <FaTrash />
                </button>
              )}
              {artist.suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {artist.suggestions.map((suggestion, i) => (
                    <li key={i} onClick={() => selectArtistSuggestion(index, suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <button type="button" onClick={addArtist} className="add-artist-button">
            <FaPlus /> Add Artist</button>
          
        </div>

        <div className="form-group">
          <label htmlFor="writer">Lyrics Writer</label>
          <input
            type="text"
            id="writer"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lyrics">Lyrics</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={10}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setlangugae(e.target.value)}
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
          <label htmlFor="videoUrl">YouTube Video URL or ID</label>
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="Enter YouTube Video URL or ID"
          />
          {videoError && <p className="error-message">{videoError}</p>}
          <small>Example: https://www.youtube.com/watch?v=MqFycWPbwmQ or MqFycWPbwmQ</small>
        </div>

        <div className="form-group">
          <label htmlFor="addedBy">Your Name</label>
          <input
            type="text"
            id="addedBy"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            required
          />
        </div>

        
        <button type="submit">Submit Lyrics</button>
      </form>
    </div>
  );
};

export default AddLyrics;
