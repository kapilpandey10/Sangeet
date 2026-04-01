import React, { useState, useEffect } from 'react';
import styles from './style/manageArtist.module.css';

const ManageArtist = () => {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', image_url: '', bio: '', status: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch('/api/admin/artists/all');
        const data = await res.json();
        setArtists(data || []);
      } catch (error) {
        console.error('Error fetching artists:', error.message);
        setErrorMessage('Failed to fetch artists.');
      }
    };
    fetchArtists();
  }, []);

  const handleEditClick = (artist) => {
    setSelectedArtist(artist);
    setFormValues({ name: artist.name, image_url: artist.image_url, bio: artist.bio, status: artist.status });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/artists/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedArtist.id, ...formValues }),
      });
      if (!res.ok) throw new Error();
      setSuccessMessage('Artist updated successfully!');
      setShowModal(false);
      setArtists(artists.map(a => a.id === selectedArtist.id ? { ...a, ...formValues } : a));
    } catch (error) {
      setErrorMessage('Failed to update artist.');
    }
  };

  const toggleArtistStatus = async (id, currentStatus) => {
    const updatedStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      const res = await fetch('/api/admin/artists/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      setArtists(artists.map(a => a.id === id ? { ...a, status: updatedStatus } : a));
    } catch (error) {
      setErrorMessage('Failed to update artist.');
    }
  };

  const renderArtists = () => {
    if (artists.length === 0) return <p>No artists available</p>;
    return artists.map((artist) => (
      <div key={artist.id} className={`${styles.artistCard} ${artist.status === 'draft' ? styles.draft : styles.published}`}>
        <div className={styles.artistInfo}>
          <img src={artist.image_url || '/default-image.jpg'} alt={artist.name} className={styles.artistImage} />
          <div>
            <h3>{artist.name}</h3>
            <p>{artist.status === 'draft' ? 'Draft' : 'Published'}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.editButton} onClick={() => handleEditClick(artist)}>Edit</button>
          <button className={styles.toggleStatusButton} onClick={() => toggleArtistStatus(artist.id, artist.status)}>
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

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Artist</h2>
            <form onSubmit={handleUpdateArtist}>
              <label>Name: <input type="text" name="name" value={formValues.name} onChange={handleChange} required /></label>
              <label>Image URL: <input type="url" name="image_url" value={formValues.image_url} onChange={handleChange} required /></label>
              <label>Bio: <textarea name="bio" value={formValues.bio} onChange={handleChange} required rows="8" /></label>
              <label>Status:
                <select name="status" value={formValues.status} onChange={handleChange} required>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <button type="submit">Update Artist</button>
              <button type="button" className={styles.closeModalButton} onClick={() => setShowModal(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArtist;