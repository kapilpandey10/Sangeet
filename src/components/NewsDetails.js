import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For accessing URL parameters
import { supabase } from '../supabaseClient'; // Supabase client
import '../style/NewsDetails.css'; // Import custom CSS for responsive design

const NewsDetails = () => {
  const { id } = useParams(); // Access the news ID from the URL
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id) // Fetch the news with the matching ID
        .single(); // Ensure only one result is fetched

      if (error) {
        setError('Failed to load news item.');
      } else {
        setNewsItem(data);
      }
      setLoading(false);
    };

    fetchNews();
  }, [id]);

  if (loading) return <p>Loading news...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="news-details-container">
      {newsItem && (
        <>
          <h1 className="news-title">{newsItem.title}</h1> {/* Title */}
          <p className="news-meta"><strong>Author:</strong> {newsItem.added_by}</p> {/* Author */}
          <p className="news-meta"><strong>Published:</strong> {new Date(newsItem.created_at).toLocaleDateString()}</p> {/* Date */}
          
          <div className="news-content" dangerouslySetInnerHTML={{ __html: newsItem.news_content }} /> {/* Rich text content from news_content column */}
        </>
      )}
    </div>
  );
};

export default NewsDetails;
