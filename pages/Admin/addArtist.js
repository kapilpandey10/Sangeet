// pages/Admin/AddArtist.js
import React, { useState, useEffect } from 'react';
import styles from './style/addArtist.module.css';

const AddArtist = () => {
  const [artistName, setArtistName] = useState('');
  const [artistImage, setArtistImage] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchArtistsWithoutBio = async () => {
      try {
        const res = await fetch('/api/admin/artists/suggestions');
        const data = await res.json();
        setArtistSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching artists:', error.message);
        setErrorMessage('Failed to fetch artists.');
      }
    };
    fetchArtistsWithoutBio();
  }, []);

  useEffect(() => {
    const fetchMusicUrlForArtist = async () => {
      if (artistName) {
        try {
          const res = await fetch(`/api/admin/artists/musicurl?artist=${encodeURIComponent(artistName)}`);
          const data = await res.json();
          setMusicUrl(data.music_url || '');
        } catch (error) {
          console.error('Error fetching music_url for artist:', error.message);
        }
      }
    };
    fetchMusicUrlForArtist();
  }, [artistName]);

  const handleAddArtist = async (e) => {
    e.preventDefault();
    if (!artistName || !artistImage || !artistBio) {
      setErrorMessage('All fields are required.');
      return;
    }

    const bioContent = /<\/?[a-z][\s\S]*>/i.test(artistBio)
      ? artistBio
      : `<p>${artistBio}</p>`;

    try {
      const res = await fetch('/api/admin/artists/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: artistName,
          image_url: artistImage,
          bio: bioContent,
          video_url: musicUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add/update artist.');
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

  const filterSuggestions = () => {
    return artistSuggestions.filter((artist) =>
      artist.toLowerCase().includes(artistName.toLowerCase())
    );
  };

  return (
    <div className={styles.addArtistContainer}>
      <h2 className={styles.heading}>Add or Edit Artist</h2>
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

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
              <option key={index} value={artist}>{artist}</option>
            ))}
          </datalist>
        </label>

        <label className={styles.label}>
          Image URL:
          <input type="url" value={artistImage}
            onChange={(e) => setArtistImage(e.target.value)}
            required placeholder="Enter image URL" className={styles.input} />
        </label>

        <label className={styles.label}>
          Artist Bio:
          <textarea value={artistBio} onChange={(e) => setArtistBio(e.target.value)}
            placeholder="Write artist bio here..." rows="5" required className={styles.textarea} />
        </label>

        <label className={styles.label}>
          Music URL:
          <input type="url" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)}
            required placeholder="Autofilled with random song music URL or edit manually" className={styles.input} />
        </label>

        <button type="submit" className={styles.button}>Add/Update Artist</button>
      </form>
    </div>
  );
};

export default AddArtist;