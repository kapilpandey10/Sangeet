import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './style/addArtist.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddArtist = () => {
  const [artistName, setArtistName] = useState('');
  const [artistImage, setArtistImage] = useState('');
  const [artistBio, setArtistBio] = useState(''); // State for bio text
  const [musicUrl, setMusicUrl] = useState(''); // Autofill for the music_url from lyrics table
  const [artistSuggestions, setArtistSuggestions] = useState([]); // List of suggested artists without bio
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch unique artist names from lyrics table and filter out artists who already have a bio
  useEffect(() => {
    const fetchArtistsWithoutBio = async () => {
      try {
        // Fetch unique artist names from the lyrics table
        const { data: lyricsArtists, error: lyricsError } = await supabase
          .from('lyrics')
          .select('artist')
          .neq('artist', null); // Fetch non-null artists

        if (lyricsError) throw lyricsError;

        const uniqueArtists = Array.from(new Set(lyricsArtists.map(lyric => lyric.artist.split(',').map(a => a.trim())).flat())); // Handle multiple artists

        // Fetch artists who already have a bio in the artists table
        const { data: artistsWithBio, error: bioError } = await supabase
          .from('artists')
          .select('name')
          .not('bio', 'is', null); // Fetch only artists with a bio

        if (bioError) throw bioError;

        // Filter out artists who already have a bio
        const bioArtistNames = artistsWithBio.map(artist => artist.name);
        const filteredArtists = uniqueArtists.filter(artist => !bioArtistNames.includes(artist));

        setArtistSuggestions(filteredArtists);
      } catch (error) {
        console.error('Error fetching artists:', error.message);
        setErrorMessage('Failed to fetch artists.');
      }
    };

    fetchArtistsWithoutBio();
  }, []);

  // Fetch random music_url for a specific artist when the artist name changes
  useEffect(() => {
    const fetchMusicUrlForArtist = async () => {
      if (artistName) {
        try {
          const { data: randomSong, error } = await supabase
            .from('lyrics')
            .select('music_url')
            .eq('artist', artistName)
            .limit(1)
            .single(); // Fetch one random song

          if (error || !randomSong) {
            console.error('Error fetching song for artist:', error);
            setMusicUrl(''); // Clear the URL if no song is found
          } else {
            setMusicUrl(randomSong.music_url || ''); // Autofill the music_url
          }
        } catch (error) {
          console.error('Error fetching music_url for artist:', error.message);
        }
      }
    };

    fetchMusicUrlForArtist();
  }, [artistName]); // Re-run this effect whenever the artistName changes

  // Handle form submission
  const handleAddArtist = async (e) => {
    e.preventDefault();

    // Check if fields are filled
    if (!artistName || !artistImage || !artistBio) {
      setErrorMessage('All fields are required.');
      return;
    }

    // Handle Bio formatting: Only set HTML if bio contains HTML, otherwise treat as plain text
    const bioContent = /<\/?[a-z][\s\S]*>/i.test(artistBio) ? artistBio : `<p>${artistBio}</p>`;

    try {
      const { data, error } = await supabase
        .from('artists')
        .upsert([{ name: artistName, image_url: artistImage, bio: bioContent, video_url: musicUrl }]); // Push music_url to the video_url column

      if (error) {
        throw error;
      }

      setSuccessMessage('Artist added/updated successfully!');
      setArtistName('');
      setArtistImage('');
      setArtistBio('');
      setMusicUrl(''); // Clear the music_url field after success
    } catch (error) {
      console.error('Error adding/updating artist:', error.message);
      setErrorMessage('Failed to add/update artist. Please try again.');
    }
  };

  // Filter artist suggestions based on input (case insensitive)
  const filterSuggestions = () => {
    return artistSuggestions.filter((artist) =>
      artist.toLowerCase().includes(artistName.toLowerCase())
    );
  };

  return (
    <div className="add-artist-container">
      <h2>Add or Edit Artist</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleAddArtist}>
        <label>
          Artist Name:
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Start typing artist name..."
            list="artist-suggestions" // Using a datalist for auto-suggestion
          />
          <datalist id="artist-suggestions">
            {filterSuggestions().map((artist, index) => (
              <option key={index} value={artist}>
                {artist}
              </option>
            ))}
          </datalist>
        </label>

        <label>
          Image URL:
          <input
            type="url"
            value={artistImage}
            onChange={(e) => setArtistImage(e.target.value)}
            required
            placeholder="Enter image URL"
          />
        </label>

        <label>
          Artist Bio:
          <textarea
            value={artistBio}
            onChange={(e) => setArtistBio(e.target.value)}
            placeholder="Write artist bio here..."
            rows="5"
            required
          />
        </label>

        <label>
          Music URL:
          <input
            type="url"
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            required
            placeholder="Autofilled with random song music URL or edit manually"
          />
        </label>

        <button type="submit">Add/Update Artist</button>
      </form>
    </div>
  );
};

export default AddArtist;
