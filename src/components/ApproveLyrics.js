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
  const [selectedLyric, setSelectedLyric] = useState(null);
  const [message, setMessage] = useState('');

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
      setSelectedLyric(null); // Clear the selected lyric after approval
      setMessage('Lyric approved successfully!');
      setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('lyrics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error rejecting lyric:', error);
    } else {
      setPendingLyrics(pendingLyrics.filter((lyric) => lyric.id !== id));
      setSelectedLyric(null); // Clear the selected lyric after rejection
      setMessage('Lyric rejected and deleted successfully!');
      setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const handleViewDetails = (lyric) => {
    setSelectedLyric(lyric);
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

  return (
    <div className="approve-lyrics-container">
      <h2>Approve or Reject Pending Lyrics</h2>
      {message && <p className="message">{message}</p>}
      {pendingLyrics.length > 0 ? (
        <div className="pending-lyrics-list">
          <ul>
            {pendingLyrics.map((lyric) => (
              <li key={lyric.id} className="lyric-item">
                <h3>{lyric.title}</h3>
                <p><strong>Artist:</strong> {lyric.artist}</p>
                <button onClick={() => handleViewDetails(lyric)}>View Details</button>
              </li>
            ))}
          </ul>
          {selectedLyric && (
            <div className="lyric-details">
              <h3>{selectedLyric.title}</h3>
              <p><strong>Artist:</strong> {selectedLyric.artist}</p>
              <p><strong>Release Year:</strong> {selectedLyric.published_date.split('-')[0]}</p>
              <p><strong>Lyrics:</strong></p>
              <pre>{selectedLyric.lyrics}</pre>

              {selectedLyric.music_url && renderYouTubeEmbed(selectedLyric.music_url)}

              <div className="action-buttons">
                <button onClick={() => handleApprove(selectedLyric.id)} className="approve-btn">Approve</button>
                <button onClick={() => handleReject(selectedLyric.id)} className="reject-btn">Reject</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No pending lyrics to approve or reject.</p>
      )}
    </div>
  );
};

export default ApproveLyrics;
