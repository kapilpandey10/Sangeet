// pages/Admin/AddLyrics.js
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaTrash, FaPlus } from 'react-icons/fa'; // Icons for adding/removing
import styles from './style/AddLyrics.module.css'; // CSS module

// Initialize Supabase client (using NEXT_PUBLIC_ prefix for environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddLyrics = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [artists, setArtists] = useState([{ name: '', suggestions: [] }]);
  const [writer, setWriter] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [message, setMessage] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  
  // Set page title
  useEffect(() => {
    document.title = 'Add Song Lyrics | Contribute to dynabyte ';
  }, []);

  // Generate a slug from the title
  const generateSlug = (title) => {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-'); // Replace multiple dashes with a single dash
  };

  // Validate the YouTube URL or video ID
  const validateYouTubeURL = (url) => {
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const idRegex = /^[a-zA-Z0-9_-]{11}$/;

    let videoId = null;

    if (urlRegex.test(url)) {
      const match = url.match(urlRegex);
      videoId = match ? match[1] : null;
    } else if (idRegex.test(url)) {
      videoId = url;
    } else {
      setVideoError('Please enter a valid YouTube Video URL.');
      return null;
    }

    setVideoError('');
    return videoId;
  };

  // Add a new artist input field
  const addArtist = () => {
    setArtists([...artists, { name: '', suggestions: [] }]);
  };

  // Remove an artist input field
  const removeArtist = (index) => {
    const updatedArtists = [...artists];
    updatedArtists.splice(index, 1);
    setArtists(updatedArtists);
  };
// Extract YouTube video ID from URL or ID
const getYouTubeVideoID = (url) => {
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const idRegex = /^[a-zA-Z0-9_-]{11}$/;

  if (urlRegex.test(url)) {
    const match = url.match(urlRegex);
    return match ? match[1] : null;
  } else if (idRegex.test(url)) {
    return url; // Treat as direct video ID
  }
  return null;
};

// Handle YouTube URL or video ID change
const handleVideoUrlChange = (e) => {
  const url = e.target.value;
  setVideoUrl(url);

  const videoId = getYouTubeVideoID(url);
  if (videoId) {
    setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    setVideoError('');
  } else {
    setThumbnail(''); // Clear thumbnail if URL/ID is invalid
    setVideoError('Please enter a valid YouTube Video URL or ID.');
  }
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
        const uniqueArtists = [...new Set(data.map((lyric) => lyric.artist))];
        updatedArtists[index].suggestions = uniqueArtists;
      } else {
        updatedArtists[index].suggestions = [];
      }
      setArtists(updatedArtists);
    } else {
      updatedArtists[index].suggestions = [];
      setArtists(updatedArtists);
    }
  };

  // Select an artist from suggestions
  const selectArtistSuggestion = (index, suggestion) => {
    const updatedArtists = [...artists];
    updatedArtists[index].name = suggestion;
    updatedArtists[index].suggestions = []; // Clear suggestions
    setArtists(updatedArtists);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalVideoId = validateYouTubeURL(videoUrl);
    if (!finalVideoId) return;

    const finalSlug = slug || generateSlug(title);

    try {
      const { data, error } = await supabase
        .from('lyrics')
        .insert([
          {
            title,
            slug: finalSlug, // Save slug
            artist: artists.map((artist) => artist.name).join(', '),
            lyrics_writer: writer,
            lyrics,
            english_lyrics: englishLyrics,
            published_date: `${releaseYear}-01-01`,
            music_url: `https://www.youtube.com/watch?v=${finalVideoId}`,
            status: 'pending',
            added_by: addedBy || 'Admin', // Set default to Admin
            language,
            description,
            thumbnail_url: thumbnail
          },
        ]);

      if (error) throw error;

      setMessage('Lyrics submitted successfully! It will be reviewed by the admin and listed soon.');
      // Reset form fields
      setTitle('');
      setSlug('');
      setArtists([{ name: '', suggestions: [] }]);
      setWriter('');
      setLyrics('');
      setEnglishLyrics('');
      setReleaseYear('');
      setVideoUrl('');
      setAddedBy('');
      setLanguage('');
      setDescription('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('An error occurred while adding lyrics: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className={styles.addLyricsContainer}>
      <h1 className={styles.addLyricsTitle}>Add New Lyrics</h1>
      {message && <p className={styles.submissionMessage}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.addLyricsForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="slug">Slug (URL-friendly)</label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Leave empty to auto-generate"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="artists">Singer</label>
          {artists.map((artist, index) => (
            <div key={index} className={styles.artistInput}>
              <input
                type="text"
                value={artist.name}
                onChange={(e) => handleArtistChange(index, e)}
                required
                placeholder="Enter Singer name"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArtist(index)}
                  className={styles.removeArtistButton}
                >
                  <FaTrash />
                </button>
              )}
              {artist.suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {artist.suggestions.map((suggestion, i) => (
                    <li key={i} onClick={() => selectArtistSuggestion(index, suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <button type="button" onClick={addArtist} className={styles.addArtistButton}>
            <FaPlus /> Add Artist
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="writer">Lyrics Writer</label>
          <input
            type="text"
            id="writer"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lyrics">Lyrics (Original Language)</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={10}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="englishLyrics">Lyrics (English)</label>
          <textarea
            id="englishLyrics"
            value={englishLyrics}
            onChange={(e) => setEnglishLyrics(e.target.value)}
            rows={10}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Short Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className={styles.formGroup}>
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

        <div className={styles.formGroup}>
        <label htmlFor="thumbnail">Thumbnail URL</label>
        <input
          id="thumbnail"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="Auto-filled from YouTube URL"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="videoUrl">YouTube Video URL/ID</label>
        <input
          type="text"
          id="videoUrl"
          value={videoUrl}
          onChange={handleVideoUrlChange}
          placeholder="YouTube Video URL or ID"
        />
        {videoError && <p className={styles.error}>{videoError}</p>}
      </div>
        <div className={styles.formGroup}>
  <label htmlFor="addedBy">Added By</label>
  <input
    list="addedByOptions"
    id="addedBy"
    value={addedBy}
    onChange={(e) => setAddedBy(e.target.value)}
    placeholder="Admin, Ashish Khanal (Mr. Thule)"
    required
  />
  <datalist id="addedByOptions">
  <option value="" disabled>
      Select who added the lyrics
    </option>
    <option value="Admin" />
    <option value="Ashish Khanal (Mr. Thule)" />
  </datalist>
</div>



        <div className={styles.formGroup}>
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />
        </div>

       

        <button type="submit" className={styles.submitButton}>Submit Lyrics</button>
      </form>
    </div>
  );
};

export default AddLyrics;
