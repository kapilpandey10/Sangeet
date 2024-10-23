import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './style/manageArtist.module.css';

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ManageArtist = () => {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null); // Store the selected artist for editing
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [formValues, setFormValues] = useState({
    name: '',
    image_url: '',
    bio: '',
    status: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all artists from the database
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data: artistsData, error } = await supabase
          .from('artists')
          .select('*');

        if (error) throw error;

        setArtists(artistsData || []);
      } catch (error) {
        console.error('Error fetching artists:', error.message);
        setErrorMessage('Failed to fetch artists.');
      }
    };

    fetchArtists();
  }, []);

  // Handle opening of modal with pre-filled artist data
  const handleEditClick = (artist) => {
    setSelectedArtist(artist);
    setFormValues({
      name: artist.name,
      image_url: artist.image_url,
      bio: artist.bio,
      status: artist.status,
    });
    setShowModal(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  // Function to update the selected artist
  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('artists')
        .update({
          name: formValues.name,
          image_url: formValues.image_url,
          bio: formValues.bio,
          status: formValues.status,
        })
        .eq('id', selectedArtist.id);

      if (error) throw error;

      setSuccessMessage('Artist updated successfully!');
      setShowModal(false);

      // Update the artist list
      setArtists(
        artists.map((artist) =>
          artist.id === selectedArtist.id ? { ...artist, ...formValues } : artist
        )
      );
    } catch (error) {
      console.error('Error updating artist:', error.message);
      setErrorMessage('Failed to update artist.');
    }
  };

  // Function to toggle artist status (Draft/Published)
  const toggleArtistStatus = async (id, currentStatus) => {
    const updatedStatus = currentStatus === 'draft' ? 'published' : 'draft';

    try {
      const { error } = await supabase
        .from('artists')
        .update({ status: updatedStatus })
        .eq('id', id);

      if (error) throw error;

      setArtists(
        artists.map((artist) =>
          artist.id === id ? { ...artist, status: updatedStatus } : artist
        )
      );
    } catch (error) {
      console.error('Error updating artist status:', error.message);
      setErrorMessage('Failed to update artist.');
    }
  };

  // Function to render artists
  const renderArtists = () => {
    if (artists.length === 0) {
      return <p>No artists available</p>;
    }

    return artists.map((artist) => (
      <div
        key={artist.id}
        className={`${styles.artistCard} ${
          artist.status === 'draft' ? styles.draft : styles.published
        }`}
      >
        <div className={styles.artistInfo}>
          <img
            src={artist.image_url || '/default-image.jpg'}
            alt={artist.name}
            className={styles.artistImage}
          />
          <div>
            <h3>{artist.name}</h3>
            <p>{artist.status === 'draft' ? 'Draft' : 'Published'}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => handleEditClick(artist)}
          >
            Edit
          </button>
          <button
            className={styles.toggleStatusButton}
            onClick={() => toggleArtistStatus(artist.id, artist.status)}
          >
            {artist.status === 'draft' ? 'Publish' : 'Set to Draft'}
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.manageArtistContainer}>
      <h2 className={styles.heading}>Manage Artists</h2>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      <div className={styles.artistList}>{renderArtists()}</div>

      {/* Modal for editing artist */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Artist</h2>
            <form onSubmit={handleUpdateArtist}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Image URL:
                <input
                  type="url"
                  name="image_url"
                  value={formValues.image_url}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Bio:
                <textarea
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  required
                  rows="8"
                />
              </label>

              <label>
                Status:
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <button type="submit">Update Artist</button>
              <button
                type="button"
                className={styles.closeModalButton}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArtist;
