import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../style/NewsDetails.css'; // Import custom CSS for responsive design

const NewsDetails = () => {
  const { id } = useParams(); // Get the news ID from the URL
  const [newsItem, setNewsItem] = useState(null);
  const [recentNews, setRecentNews] = useState([]); // To store recent news
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstImage, setFirstImage] = useState(''); // Store the first image from news content

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single(); // Fetch the news with the matching ID

        if (newsError) {
          setError('Failed to load news item.');
        } else {
          setNewsItem(newsData);
          if (newsData.news_content) {
            const extractedImage = extractFirstImage(newsData.news_content); // Extract the first image from content
            setFirstImage(extractedImage);
          }
        }

        // Fetch recent news
        const { data: recentNewsData, error: recentError } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4); // Get the 4 latest news items

        if (!recentError) {
          setRecentNews(recentNewsData);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  // Function to extract the first image from the HTML content
  const extractFirstImage = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const imgElement = doc.querySelector('img'); // Get the first image tag

    return imgElement ? imgElement.src : ''; // Return the image source or an empty string
  };

  if (loading) return <p>Loading news...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="news-details-layout">
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

          <div className="news-main-content">
            <div className="news-main">
              <h1 className="news-title">{newsItem.title}</h1>
              <p className="news-author">
                <strong>Author:</strong> {newsItem.added_by}
              </p>
              <p className="news-date">
                <strong>Published on:</strong>{' '}
                {new Date(newsItem.created_at).toLocaleDateString()}
              </p>
              {/* Resized image and content */}
              {firstImage && (
                <img src={firstImage} alt="News Visual" className="news-image" />
              )}
              <div
                className="news-content"
                dangerouslySetInnerHTML={{ __html: newsItem.news_content }}
              />
            </div>

            {/* Sidebar */}
            <div className="news-sidebar">
              <h3>Recent News</h3>
              {/* Display the most recent news */}
              {recentNews.length > 0 && (
                <div className="recent-news-item">
                  <Link to={`/news/${recentNews[0].id}/${generateSlug(recentNews[0].title)}`}>
                    <img
                      src={extractFirstImage(recentNews[0].news_content)}
                      alt="Recent News"
                      className="recent-news-image"
                    />
                    <h4>{recentNews[0].title}</h4>
                  </Link>
                </div>
              )}

              {/* Display the next 3 news */}
              <div className="other-news">
                {recentNews.slice(1, 4).map((news) => (
                  <div key={news.id} className="other-news-item">
                    <Link to={`/news/${news.id}/${generateSlug(news.title)}`}>
                      <h5>{news.title}</h5>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to generate the slug from the title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove non-English characters and special symbols
    .replace(/\s+/g, '_'); // Replace spaces with underscores
};

export default NewsDetails;
