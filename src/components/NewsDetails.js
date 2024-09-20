import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet'; // Import Helmet for SEO
import '../style/NewsDetails.css';

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
        .eq('id', id)
        .single();

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
          {/* SEO with Helmet */}
          <Helmet>
            <title>{newsItem.title} | My News Site</title>
            <meta name="description" content={newsItem.news_content.substring(0, 160)} /> {/* Description */}
            <meta name="keywords" content="news, latest news, breaking news, {newsItem.title}" />

            {/* Open Graph Meta Tags for Facebook, LinkedIn */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={newsItem.title} />
            <meta property="og:description" content={newsItem.news_content.substring(0, 160)} />
            <meta property="og:image" content={newsItem.cover_photo} /> {/* Make sure cover_photo has a public URL */}
            <meta property="og:url" content={`https://pandeykapil.com.np/news/${id}`} />
            <meta property="og:site_name" content="My News Site" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={newsItem.title} />
            <meta name="twitter:description" content={newsItem.news_content.substring(0, 160)} />
            <meta name="twitter:image" content={newsItem.cover_photo} />
            <meta name="twitter:site" content="@YourTwitterHandle" />

            {/* Canonical URL for SEO */}
            <link rel="canonical" href={`https://pandeykapil.com.np/news/${id}`} />
          </Helmet>

          {/* Displaying the news content */}
          <h1 className="news-title">{newsItem.title}</h1>
          <p className="news-meta"><strong>Author:</strong> {newsItem.added_by}</p>
          <p className="news-meta"><strong>Published:</strong> {new Date(newsItem.created_at).toLocaleDateString()}</p>
          
          {newsItem.cover_photo && (
            <img 
              src={newsItem.cover_photo} 
              alt={`Cover for ${newsItem.title}`} 
              className="news-cover-photo"
              style={{ width: '100%', height: 'auto' }}
            />
          )}

          <div 
            className="news-content" 
            dangerouslySetInnerHTML={{ __html: newsItem.news_content }} 
          />
        </>
      )}
    </div>
  );
};

export default NewsDetails;
