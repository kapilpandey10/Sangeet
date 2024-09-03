import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/AdminLyrics.css';

// Accessing environment variables directly
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initializing Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AdminLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);

  useEffect(() => {
    const fetchPendingLyrics = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('status', 'pending'); // Fetch only pending lyrics

      if (error) {
        console.error('Error fetching pending lyrics:', error);
      } else {
        setPendingLyrics(data);
      }
    };

    fetchPendingLyrics();
  }, []);

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .update({ status: 'approved' }) // Update status to approved
      .eq('id', id);

    if (error) {
      console.error('Error approving lyric:', error);
    } else {
      alert('Lyric approved successfully!');
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== id));
    }
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .delete() // Alternatively, you can update the status to 'rejected'
      .eq('id', id);

    if (error) {
      console.error('Error rejecting lyric:', error);
    } else {
      alert('Lyric rejected successfully!');
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== id));
    }
  };

  return (
    <div className="admin-lyrics-container">
      <h1>Pending Lyrics for Approval</h1>
      {pendingLyrics.length > 0 ? (
        <ul>
          {pendingLyrics.map((lyric) => (
            <li key={lyric.id}>
              <h3>{lyric.title}</h3>
              <p><strong>Artist:</strong> {lyric.artist}</p>
              <p>{lyric.lyrics}</p>
              <button onClick={() => handleApprove(lyric.id)}>Approve</button>
              <button onClick={() => handleReject(lyric.id)}>Reject</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending lyrics.</p>
      )}
    </div>
  );
};

export default AdminLyrics;
