import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client
import { Link } from 'react-router-dom';
import '../style/NewsBucket.css'; // Custom CSS

const NewsBucket = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news') // Your 'news' table
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load news.');
      } else {
        setNews(data);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  if (loading) return <p>Loading news...</p>;
  if (error) return <p>{error}</p>;

  // Helper function to generate the slug from the title
  const generateSlug = (title) => {
    const cleanedTitle = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '') // Remove non-English characters and special symbols
      .replace(/\s+/g, '_'); // Replace spaces with underscores

    return cleanedTitle.length > 15 ? cleanedTitle.slice(0, 15) : cleanedTitle;
  };

  return (
    <div className="news-container">
      <h1>Latest News</h1>
      <div className="news-grid">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            {/* Cover photo on the left */}
            <div className="news-card-content">
              <img
                src={item.cover_photo}
                alt="Cover"
                className="news-cover-image"
              />
              {/* Title on the right */}
              <div className="news-details">
                <h2>{item.title}</h2>
                {/* Link to read more */}
                <Link
                  to={`/news/${item.id}/${generateSlug(item.title)}`}
                  className="read-more"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsBucket;
