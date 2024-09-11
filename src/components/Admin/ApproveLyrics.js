import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ConfirmMsg from '../ConfirmMsg'; // Import the confirmation modal
import MatchLyrics from './matchlyrics'; // Import MatchLyrics component
import './style/ApproveLyrics.css'; // Include the stylesheet

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [lyricToProcess, setLyricToProcess] = useState(null);
  const [confirmAction, setConfirmAction] = useState(''); // For approve/reject action
  const [duplicateLyrics, setDuplicateLyrics] = useState([]); // State for duplicate lyrics

  // Fetch pending lyrics
  useEffect(() => {
    const fetchPendingLyrics = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics')
          .select('*')
          .eq('status', 'pending');
        if (error) throw error;
        setPendingLyrics(data || []);
      } catch (error) {
        console.error('Error fetching pending lyrics:', error);
        setPendingLyrics([]);
      }
    };
    fetchPendingLyrics();
    checkDuplicateLyrics();
  }, []);

  // Check for duplicate lyrics
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

  // Find duplicate lyrics
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

  // Handle approve action
  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('lyrics')
        .update({ status: 'approved' })
        .eq('id', lyricToProcess);
      if (error) throw error;
      setPendingLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== lyricToProcess));
      setMessageType('success');
      setMessage('Lyrics approved successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to approve the lyrics. Please try again.');
    } finally {
      setShowConfirm(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    try {
      const { error } = await supabase.from('lyrics').delete().eq('id', lyricToProcess);
      if (error) throw error;
      setPendingLyrics((prevLyrics) => prevLyrics.filter((lyric) => lyric.id !== lyricToProcess));
      setMessageType('success');
      setMessage('Lyrics rejected and deleted successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to reject the lyrics. Please try again.');
    } finally {
      setShowConfirm(false);
    }
  };

  // Show confirmation modal for approve or reject
  const confirmActionModal = (action, lyricId) => {
    setConfirmAction(action);
    setLyricToProcess(lyricId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction === 'approve') {
      handleApprove();
    } else if (confirmAction === 'reject') {
      handleReject();
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setLyricToProcess(null);
  };

  return (
    <div className="approve-lyrics-container">
      <h2>Approve or Reject Pending Lyrics</h2>

      {/* Success/Error messages */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="content-wrapper">
        <div className="pending-lyrics">
          <ul>
            {pendingLyrics.map((lyric) => (
              <li key={lyric.id} className="lyric-item">
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <p><strong>Added By:</strong> {lyric.added_by}</p>
                <button onClick={() => confirmActionModal('approve', lyric.id)} className="approve-btn">Approve</button>
                <button onClick={() => confirmActionModal('reject', lyric.id)} className="reject-btn">Reject</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Display potential duplicate lyrics if any */}
        {duplicateLyrics.length > 0 && (
          <div className="duplicate-lyrics-section">
            <h2>Potential Duplicate Lyrics</h2>
            <MatchLyrics duplicateLyrics={duplicateLyrics} />
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmMsg
          message={`Are you sure you want to ${confirmAction} this lyric?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ApproveLyrics;
