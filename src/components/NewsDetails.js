// File: src/components/NewsDetails.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const NewsDetails = () => {
  const { id } = useParams(); // Get the news ID from the URL
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstImage, setFirstImage] = useState(null); // To store the first image from news content

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single(); // Fetch the news with the matching ID

      if (error) {
        setError('Failed to load news item.');
      } else {
        setNewsItem(data);
        extractFirstImage(data.news_content); // Extract the first image from the news content
      }
      setLoading(false);
    };

    fetchNews();
  }, [id]);

  // Function to extract the first image from the HTML content
  const extractFirstImage = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const imgElement = doc.querySelector('img'); // Get the first image tag

    if (imgElement) {
      setFirstImage(imgElement.src); // Set the src of the first image as the preview image
    }
  };

  if (loading) return <p>Loading news...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="news-details-container">
      {newsItem && (
        <>
          {/* Dynamic Open Graph meta tags using Helmet */}
          <Helmet>
            <title>{newsItem.title}</title>
            <meta property="og:title" content={newsItem.title} />
            <meta
              property="og:description"
              content={newsItem.news_content.slice(0, 160)} // Short description
            />
            <meta
              property="og:image"
              content={firstImage || 'default_image_url'} // Use the first image from content or fallback
            />
            <meta
              property="og:url"
              content={`https://pandeykapil.com.np/news/${newsItem.id}`}
            />
            <meta property="og:type" content="article" />
          </Helmet>

          <h1>{newsItem.title}</h1>
          <p>
            <strong>Author:</strong> {newsItem.added_by}
          </p>
          <p>
            <strong>Published on:</strong>{' '}
            {new Date(newsItem.created_at).toLocaleDateString()}
          </p>
          <div dangerouslySetInnerHTML={{ __html: newsItem.news_content }} />
        </>
      )}
    </div>
  );
};

export default NewsDetails;
