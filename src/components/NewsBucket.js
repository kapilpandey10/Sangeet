import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client
import { Link } from 'react-router-dom';
import '../style/NewsBucket.css'; // Import custom CSS for responsive design

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

  // Helper function to extract the first image URL from news content
  const extractFirstImage = (content) => {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : ''; // Return the src of the first image, or an empty string if none found
  };

  return (
    <div className="news-container">
      <h1 className="page-title">Latest News</h1>
      <div className="featured-news">
        {/* Display the latest/featured news larger */}
        {news[0] && (
          <div className="featured-news-item">
            <img
              src={extractFirstImage(news[0].news_content) || news[0].cover_photo} // Use extracted image or fallback to cover_photo
              alt="Cover"
              className="featured-cover-image"
            />
            <div className="featured-news-content">
              <h2 className="featured-title">{news[0].title}</h2>
              <p className="featured-excerpt">
                {news[0].news_content.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 150)}... {/* Strip HTML tags */}
              </p>
              <Link
                to={`/news/${news[0].id}/${generateSlug(news[0].title)}`}
                className="read-more-featured"
              >
                Read More
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="news-grid">
        {news.slice(1).map((item) => (
          <div key={item.id} className="news-card">
            <img
              src={extractFirstImage(item.news_content) || item.cover_photo} // Extract first image or use cover_photo
              alt="Cover"
              className="news-cover-image"
            />
            <div className="news-card-content">
              <h2 className="news-title">{item.title}</h2>
              <p className="news-excerpt">
                {item.news_content.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 100)}... {/* Strip HTML tags */}
              </p>
              <Link
                to={`/news/${item.id}/${generateSlug(item.title)}`}
                className="read-more"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsBucket;
