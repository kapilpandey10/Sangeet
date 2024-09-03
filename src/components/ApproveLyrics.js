import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/ApproveLyrics.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ApproveLyrics = () => {
  const [pendingLyrics, setPendingLyrics] = useState([]);

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

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('Error approving lyric:', error);
    } else {
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== id));
    }
  };

  return (
    <div className="approve-lyrics-container">
      <h2>Approve Pending Lyrics</h2>
      {pendingLyrics.length > 0 ? (
        <ul>
          {pendingLyrics.map((lyric) => (
            <li key={lyric.id}>
              <h3>{lyric.title}</h3>
              <p><strong>Artist:</strong> {lyric.artist}</p>
              <button onClick={() => handleApprove(lyric.id)}>Approve</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending lyrics to approve.</p>
      )}
    </div>
  );
};

export default ApproveLyrics;
