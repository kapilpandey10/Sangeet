import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AddYouTubeVideo = () => {
  const [videoId, setVideoId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoId.trim()) {
      setMessage('Please provide a valid YouTube Video ID.');
      return;
    }

    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([{ video_id: videoId }]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('YouTube video added successfully!');
      setVideoId(''); // Clear the input after submission
    }
  };

  return (
    <div>
      <h2>Add YouTube Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="videoId">YT Video ID</label>
          <input
            type="text"
            id="videoId"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="VIDEO-ID-HERE"
          />
          <small>Example: https://www.youtube.com/embed/{videoId || 'VIDEO-ID-HERE'}</small>
        </div>
        <button type="submit">Add Video</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddYouTubeVideo;
