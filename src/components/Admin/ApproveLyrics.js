import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from '../ConfirmMsg'; // Import modal for confirmation
import MatchLyrics from './matchlyrics'; // Import MatchLyrics component
import './style/ApproveLyrics.css'; // Include the stylesheet

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [editedLyric, setEditedLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [lyricToReject, setLyricToReject] = useState(null);
  const [duplicateLyrics, setDuplicateLyrics] = useState([]); // State for duplicate lyrics

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
    checkDuplicateLyrics(); // Check for duplicates
  }, []);

  const checkDuplicateLyrics = async () => {
    const { data: allLyrics, error } = await supabase
      .from('lyrics')
      .select('*');

    if (error) {
      console.error('Error fetching all lyrics:', error);
      return;
    }

    const duplicates = findDuplicateLyrics(allLyrics);
    setDuplicateLyrics(duplicates);
  };

  const findDuplicateLyrics = (lyrics) => {
    const duplicates = [];

    for (let i = 0; i < lyrics.length; i++) {
      for (let j = i + 1; j < lyrics.length; j++) {
        const similarity = compareLyrics(lyrics[i].lyrics, lyrics[j].lyrics);
        if (similarity > 0.9) {
          duplicates.push({ lyric1: lyrics[i], lyric2: lyrics[j] });
        }
      }
    }
    return duplicates;
  };

  const compareLyrics = (lyric1, lyric2) => {
    const normalize = (str) => str.replace(/\s+/g, ' ').trim().toLowerCase();
    const l1 = normalize(lyric1);
    const l2 = normalize(lyric2);
    const commonLength = Math.min(l1.length, l2.length);

    if (commonLength === 0) return 0;

    let matchCount = 0;
    for (let i = 0; i < commonLength; i++) {
      if (l1[i] === l2[i]) {
        matchCount++;
      }
    }

    return matchCount / commonLength;
  };

  const handleApprove = async (id) => {
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
      .eq('id', id);

    if (error) {
      console.error('Error approving lyric:', error);
    } else {
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== id));
      setSelectedLyric(null);
      setMessage('Lyric approved successfully!');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleReject = async () => {
    const { error } = await supabase
      .from('lyrics')
      .delete()
      .eq('id', lyricToReject);

    if (error) {
      console.error('Error rejecting lyric:', error);
    } else {
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== lyricToReject));
      setSelectedLyric(null);
      setMessage('Lyric rejected successfully!');
      setTimeout(() => setMessage(''), 5000);
    }

    setShowConfirm(false);
    setLyricToReject(null);
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

  const showRejectConfirm = (id) => {
    setLyricToReject(id);
    setShowConfirm(true);
  };

  const cancelReject = () => {
    setShowConfirm(false);
    setLyricToReject(null);
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

        {duplicateLyrics.length > 0 && (
          <div className="duplicate-lyrics-section">
            <h2>Potential Duplicate Lyrics</h2>
            <MatchLyrics duplicateLyrics={duplicateLyrics} />
          </div>
        )}

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
            <textarea
              value={editedLyric.lyrics}
              onChange={(e) => handleEditChange('lyrics', e.target.value)}
            ></textarea>

            <div className="action-buttons">
              <button onClick={() => handleApprove(selectedLyric.id)} className="approve-btn">Approve</button>
              <button onClick={() => showRejectConfirm(selectedLyric.id)} className="reject-btn">Reject</button>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmMsg
          message="Are you sure you want to reject this lyric?"
          onConfirm={handleReject}
          onCancel={cancelReject}
        />
      )}
    </div>
  );
};

export default ApproveLyrics;
