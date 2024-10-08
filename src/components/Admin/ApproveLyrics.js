import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from '../ConfirmMsg'; // Import modal for confirmation
import './style/ApproveLyrics.css'; // Include the stylesheet

// Supabase client setup without session persistence
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [editedLyric, setEditedLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(''); // To track if it's "approve" or "reject"
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch pending lyrics from Supabase
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

  // Handle approval or rejection of lyrics
  const handleConfirmAction = async () => {
    setLoading(true); // Set loading to true

    if (actionType === 'approve') {
      // Approve logic
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
      // Reject logic (delete the lyric)
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

    setShowConfirm(false); // Close modal
    setActionType('');
    setLoading(false); // Reset loading
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  // View details of the selected lyric
  const handleViewDetails = (lyric) => {
    setSelectedLyric(lyric);
    setEditedLyric({ ...lyric });
  };

  // Handle edit changes in the form fields
  const handleEditChange = (field, value) => {
    setEditedLyric((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Extract YouTube ID from the URL
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  // Render YouTube embed if a valid URL exists
  const renderYouTubeEmbed = (url) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1`;

    return (
      <div className="youtube-video-section">
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

  // Show modal for approving or rejecting lyrics
  const showConfirmModal = (type) => {
    setActionType(type);
    setShowConfirm(true);
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setActionType('');
  };

  return (
    <div className="approve-lyrics-container">
      <h2>Approve or Reject Pending Lyrics</h2>
      {message && <p className="message">{message}</p>}
      <div className="content-wrapper">
        <div className="pending-lyrics">
          <ul>
            {pendingLyrics.map((lyric) => (
              <li key={lyric.id} className="lyric-item">
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <p><strong>Added By:</strong> {lyric.added_by}</p>
                <button onClick={() => handleViewDetails(lyric)}>View Details</button>
              </li>
            ))}
          </ul>
        </div>

        {selectedLyric && (
          <div className="lyric-details">
            <h3>Edit Lyric Details</h3>
            <div className="edit-field">
              <label>Title:</label>
              <input
                type="text"
                value={editedLyric.title}
                onChange={(e) => handleEditChange('title', e.target.value)}
              />
            </div>
            <div className="edit-field">
              <label>Artist:</label>
              <input
                type="text"
                value={editedLyric.artist}
                onChange={(e) => handleEditChange('artist', e.target.value)}
              />
            </div>
            <div className="edit-field">
              <label>Language:</label>
              <input
                type="text"
                value={editedLyric.language}
                onChange={(e) => handleEditChange('language', e.target.value)}
              />
            </div>
            <div className="edit-field">
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

            {/* Render YouTube video if a music URL exists */}
            {selectedLyric.music_url && renderYouTubeEmbed(selectedLyric.music_url)}

            <div className="action-buttons">
              <button
                onClick={() => showConfirmModal('approve')}
                className="approve-btn"
              >
                {loading && actionType === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => showConfirmModal('reject')}
                className="reject-btn"
              >
                {loading && actionType === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmMsg
          message={`Are you sure you want to ${actionType === 'approve' ? 'approve' : 'reject'} this lyric?`}
          onConfirm={handleConfirmAction}
          onCancel={cancelAction}
          confirmButtonText={actionType === 'approve' ? 'Yes, Approve' : 'Yes, Reject'} // Change button text based on action
          cancelButtonText="Cancel"
          show={showConfirm} // Ensure the modal knows when to display
        />
      )}
    </div>
  );
};

export default ApproveLyrics;
