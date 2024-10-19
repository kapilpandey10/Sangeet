import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from '../../components/ConfirmMsg'; // Import modal for confirmation
import styles from './style/ApproveLyrics.module.css'; // Use CSS modules

// Supabase client setup without session persistence
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [editedLyric, setEditedLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(''); // Track if it's "approve" or "reject"
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending lyrics:', error);
      } else {
        setPendingLyrics(data);
      }
    };

    fetchPendingLyrics();
  }, []);

  const handleConfirmAction = async () => {
    setLoading(true);

    if (actionType === 'approve') {
      const { error } = await supabase
        .from('lyrics')
        .update({
          status: 'approved',
          title: editedLyric.title,
          artist: editedLyric.artist,
          lyrics: editedLyric.lyrics,
          language: editedLyric.language,
          added_by: editedLyric.added_by,
        })
        .eq('id', selectedLyric.id);

      if (error) {
        console.error('Error approving lyric:', error);
      } else {
        setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== selectedLyric.id));
        setSelectedLyric(null);
        setMessage('Lyric approved successfully!');
      }
    } else if (actionType === 'reject') {
      const { error } = await supabase
        .from('lyrics')
        .delete()
        .eq('id', selectedLyric.id);

      if (error) {
        console.error('Error rejecting lyric:', error);
      } else {
        setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== selectedLyric.id));
        setSelectedLyric(null);
        setMessage('Lyric rejected successfully!');
      }
    }

    setShowConfirm(false);
    setActionType('');
    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleViewDetails = (lyric) => {
    setSelectedLyric(lyric);
    setEditedLyric({ ...lyric });
  };

  const handleEditChange = (field, value) => {
    setEditedLyric((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const renderYouTubeEmbed = (url) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1`;

    return (
      <div className={styles.youtubeVideoSection}>
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  const showConfirmModal = (type) => {
    setActionType(type);
    setShowConfirm(true);  // Display the modal
  };

 const cancelAction = () => {
  setShowConfirm(false);  // Hide the modal
};

  return (
    <div className={styles.approveLyricsContainer}>
      <h2 className={styles.header}>Approve or Reject Pending Lyrics</h2>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.contentWrapper}>
        <div className={styles.pendingLyrics}>
          <ul>
            {pendingLyrics.map((lyric) => (
              <li key={lyric.id} className={styles.lyricItem}>
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <p><strong>Added By:</strong> {lyric.added_by}</p>
                <button onClick={() => handleViewDetails(lyric)}>View Details</button>
              </li>
            ))}
          </ul>
        </div>

        {selectedLyric && (
          <div className={styles.lyricDetails}>
            <h3>Edit Lyric Details</h3>
            <div className={styles.editField}>
              <label>Title:</label>
              <input
                type="text"
                value={editedLyric.title}
                onChange={(e) => handleEditChange('title', e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label>Artist:</label>
              <input
                type="text"
                value={editedLyric.artist}
                onChange={(e) => handleEditChange('artist', e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label>Language:</label>
              <input
                type="text"
                value={editedLyric.language}
                onChange={(e) => handleEditChange('language', e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label>Added By:</label>
              <input
                type="text"
                value={editedLyric.added_by}
                onChange={(e) => handleEditChange('added_by', e.target.value)}
              />
            </div>
            <p><strong>Release Year:</strong> {selectedLyric.published_date.split('-')[0]}</p>
            <p><strong>Lyrics:</strong></p>
            <textarea
              value={editedLyric.lyrics}
              onChange={(e) => handleEditChange('lyrics', e.target.value)}
              rows={8}
            ></textarea>

            {selectedLyric.music_url && renderYouTubeEmbed(selectedLyric.music_url)}

            <div className={styles.actionButtons}>
              <button
                onClick={() => showConfirmModal('approve')}
                className={styles.approveBtn}
              >
                {loading && actionType === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => showConfirmModal('reject')}
                className={styles.rejectBtn}
              >
                {loading && actionType === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal rendering */}
      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={handleConfirmAction}
          onCancel={cancelAction}
          message={`Are you sure you want to ${actionType === 'approve' ? 'approve' : 'reject'} this lyric?`}
          confirmButtonText={actionType === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
          cancelButtonText="Cancel"
        />
      )}
    </div>
  );
};

export default ApproveLyrics;
