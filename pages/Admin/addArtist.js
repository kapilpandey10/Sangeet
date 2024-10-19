// pages/Admin/AddArtist.js
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './style/AddArtist.module.css';

// Access environment variables (use NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddArtist = () => {
  const [artistName, setArtistName] = useState('');
  const [artistImage, setArtistImage] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [artistSuggestions, setArtistSuggestions] = useState([]);
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
          .neq('artist', null);

        if (lyricsError) throw lyricsError;

        const uniqueArtists = Array.from(
          new Set(
            lyricsArtists
              .map((lyric) => lyric.artist.split(',').map((a) => a.trim()))
              .flat()
          )
        );

        // Fetch artists who already have a bio in the artists table
        const { data: artistsWithBio, error: bioError } = await supabase
          .from('artists')
          .select('name')
          .not('bio', 'is', null);

        if (bioError) throw bioError;

        // Filter out artists who already have a bio
        const bioArtistNames = artistsWithBio.map((artist) => artist.name);
        const filteredArtists = uniqueArtists.filter(
          (artist) => !bioArtistNames.includes(artist)
        );

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
            .single();

          if (error || !randomSong) {
            console.error('Error fetching song for artist:', error);
            setMusicUrl('');
          } else {
            setMusicUrl(randomSong.music_url || '');
          }
        } catch (error) {
          console.error('Error fetching music_url for artist:', error.message);
        }
      }
    };

    fetchMusicUrlForArtist();
  }, [artistName]);

  // Handle form submission
  const handleAddArtist = async (e) => {
    e.preventDefault();

    // Check if fields are filled
    if (!artistName || !artistImage || !artistBio) {
      setErrorMessage('All fields are required.');
      return;
    }

    // Handle Bio formatting
    const bioContent = /<\/?[a-z][\s\S]*>/i.test(artistBio)
      ? artistBio
      : `<p>${artistBio}</p>`;

    try {
      const { data, error } = await supabase.from('artists').upsert([
        {
          name: artistName,
          image_url: artistImage,
          bio: bioContent,
          video_url: musicUrl,
        },
      ]);

      if (error) {
        throw error;
      }

      setSuccessMessage('Artist added/updated successfully!');
      setArtistName('');
      setArtistImage('');
      setArtistBio('');
      setMusicUrl('');
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
    <div className={styles.addArtistContainer}>
      <h2 className={styles.heading}>Add or Edit Artist</h2>
      {successMessage && (
        <p className={styles.successMessage}>{successMessage}</p>
      )}
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      <form onSubmit={handleAddArtist} className={styles.form}>
        <label className={styles.label}>
          Artist Name:
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Start typing artist name..."
            list="artist-suggestions"
            className={styles.input}
          />
          <datalist id="artist-suggestions">
            {filterSuggestions().map((artist, index) => (
              <option key={index} value={artist}>
                {artist}
              </option>
            ))}
          </datalist>
        </label>

        <label className={styles.label}>
          Image URL:
          <input
            type="url"
            value={artistImage}
            onChange={(e) => setArtistImage(e.target.value)}
            required
            placeholder="Enter image URL"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Artist Bio:
          <textarea
            value={artistBio}
            onChange={(e) => setArtistBio(e.target.value)}
            placeholder="Write artist bio here..."
            rows="5"
            required
            className={styles.textarea}
          />
        </label>

        <label className={styles.label}>
          Music URL:
          <input
            type="url"
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            required
            placeholder="Autofilled with random song music URL or edit manually"
            className={styles.input}
          />
        </label>

        <button type="submit" className={styles.button}>
          Add/Update Artist
        </button>
      </form>
    </div>
  );
};

export default AddArtist;
