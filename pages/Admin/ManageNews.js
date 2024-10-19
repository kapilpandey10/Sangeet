import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Import your Supabase client
import { useNavigate } from 'react-router-dom';
import './style/ManageNews.module.css'; // Custom CSS for styling

const ManageNews = () => {
  const [newsList, setNewsList] = useState([]); // State to store fetched news
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // For navigation to the edit page

  // Fetch all news from the Supabase database
  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news') // Table name
        .select('*')
        .order('created_at', { ascending: false }); // Fetch news by most recent

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      setNewsList(data); // Store fetched news in state
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Call the fetchNews function when the component mounts
  useEffect(() => {
    fetchNews();
  }, []);

  // Function to handle the edit button click
  const handleEdit = (newsItem) => {
    // Navigate to AddNews.js with the news data loaded for editing
    navigate('/editnews', { state: { news: newsItem } });
  };

  // Function to handle the delete button
  const handleDelete = async (newsId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this news?');
    if (confirmDelete) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', newsId);

        if (error) {
          console.error('Error deleting news:', error);
          return;
        }

        // Refresh the news list after deletion
        fetchNews();
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Display a loading indicator while fetching data
  }

  return (
    <div className="manage-news-container">
      <h1>Manage News</h1>

      {/* Display drafts first, then published news */}
      <h2>Draft News</h2>
      {newsList.filter((news) => news.is_draft).length > 0 ? (
        <ul className="news-list">
          {newsList
            .filter((news) => news.is_draft)
            .map((news) => (
              <li key={news.id} className="news-item">
                <span>{news.title}</span>
                <div>
                  <button onClick={() => handleEdit(news)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(news.id)} className="delete-button">Delete</button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p>No draft news available.</p>
      )}

      <h2>Published News</h2>
      {newsList.filter((news) => !news.is_draft).length > 0 ? (
        <ul className="news-list">
          {newsList
            .filter((news) => !news.is_draft)
            .map((news) => (
              <li key={news.id} className="news-item">
                <span>{news.title}</span>
                <div>
                  <button onClick={() => handleEdit(news)} className="edit-button">Update</button>
                  <button onClick={() => handleDelete(news.id)} className="delete-button">Delete</button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p>No published news available.</p>
      )}
    </div>
  );
};

export default ManageNews;
