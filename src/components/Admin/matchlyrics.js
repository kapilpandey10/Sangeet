import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Import Supabase client
import { compareTwoStrings } from 'string-similarity'; // Use string-similarity package for comparison
import './style/matchlyrics.css';  // Import the updated CSS

const MatchLyrics = () => {
  const [lyricsList, setLyricsList] = useState([]);
  const [duplicatePairs, setDuplicatePairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all lyrics from the database
  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const { data: lyricsData, error } = await supabase
          .from('lyrics')
          .select('*'); // Fetch all lyrics
        
        if (error) throw error;
        
        setLyricsList(lyricsData);
        findDuplicates(lyricsData);
      } catch (error) {
        setError('Error fetching lyrics.');
        console.error('Error fetching lyrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, []);

  // Compare lyrics to find duplicates based on similarity
  const findDuplicates = (lyricsData) => {
    let potentialDuplicates = [];
    for (let i = 0; i < lyricsData.length; i++) {
      for (let j = i + 1; j < lyricsData.length; j++) {
        const similarity = compareTwoStrings(lyricsData[i].lyrics, lyricsData[j].lyrics);
        if (similarity > 0.4) { // If similarity is greater than 40%
          potentialDuplicates.push({
            lyric1: lyricsData[i],
            lyric2: lyricsData[j],
            similarity: (similarity * 100).toFixed(2),
          });
        }
      }
    }
    setDuplicatePairs(potentialDuplicates);
  };

  // Approve lyrics as not duplicate
  const approveNotDuplicate = async (lyric1, lyric2) => {
    alert('Lyrics approved as not duplicate');
  };

  // Delete duplicate lyrics
  const deleteDuplicate = async (lyricId) => {
    try {
      const { error } = await supabase
        .from('lyrics')
        .delete()
        .eq('id', lyricId);

      if (error) throw error;

      alert('Duplicate lyrics deleted successfully');
      // Refresh the page or update state to remove deleted lyrics
    } catch (error) {
      console.error('Error deleting lyrics:', error);
      alert('Error deleting lyrics');
    }
  };

  if (loading) {
    return <p>Loading lyrics...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container">
      <h1>Duplicate Lyrics Finder</h1>
      {duplicatePairs.length > 0 ? (
        <div>
          {duplicatePairs.map((pair, index) => (
            <div key={index} className="duplicate-pair">
              <h3>Potential Duplicate Lyrics ({pair.similarity}% similar):</h3>
              <div className="lyric-item">
                <h4>{pair.lyric1.title} by {pair.lyric1.artist}</h4>
                <pre>{pair.lyric1.lyrics}</pre>
              </div>
              <div className="lyric-item">
                <h4>{pair.lyric2.title} by {pair.lyric2.artist}</h4>
                <pre>{pair.lyric2.lyrics}</pre>
              </div>
              <div className="actions">
                <button onClick={() => approveNotDuplicate(pair.lyric1, pair.lyric2)} className="approve-btn">Approve as Not Duplicate</button>
                <button onClick={() => deleteDuplicate(pair.lyric2.id)} className="delete-btn">Delete Duplicate (Second)</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No duplicate lyrics found.</p>
      )}
    </div>
  );
};

export default MatchLyrics;
