import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../style/hotnews.css';

const HotNews = () => {
  const [news, setNews] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [closing, setClosing] = useState(false); // Track if the overlay is closing
  const [newsList, setNewsList] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);

  const fetchNews = async () => {
    try {
      let { data: blogs, error } = await supabase
        .from('blogs')
        .select('title, thumbnail_url, published_date, slug')
        .order('published_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching blogs:', error);
      } else {
        if (blogs.length > 0) {
          console.log('Fetched news:', blogs);
          setNewsList(blogs);
        } else {
          console.log('No news data available');
        }
      }
    } catch (err) {
      console.error('Error during fetchNews:', err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (newsList.length > 0) {
      const showFirstNews = setTimeout(() => {
        console.log('Displaying first news:', newsList[newsIndex]);
        setNews(newsList[newsIndex]);
        setShowOverlay(true);
      }, 5000);

      const suggestNews = setInterval(() => {
        setNewsIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % newsList.length;
          console.log('Suggesting next news:', newsList[nextIndex]);
          setNews(newsList[nextIndex]);
          setShowOverlay(true);
          return nextIndex;
        });
      }, 30000);

      return () => {
        clearTimeout(showFirstNews);
        clearInterval(suggestNews);
      };
    }
  }, [newsList, newsIndex]);

  const handleClose = (e) => {
    e.stopPropagation();
    setClosing(true); // Add the closing class for the slide-out animation
    setTimeout(() => {
      setShowOverlay(false);
      setClosing(false); // Reset the closing state
    }, 400); // Matches the CSS animation duration
  };

  const handleNewsClick = (slug) => {
    const blogUrl = `https://pandeykapil.com.np/blog/${slug}`;
    console.log('Redirecting to:', blogUrl);
    window.location.href = blogUrl;
  };

  return (
    <>
      {showOverlay && news && (
        <div className={`hotnews-overlay ${showOverlay ? 'show' : ''} ${closing ? 'closing' : ''}`}>
          <div className="hotnews-content" onClick={() => handleNewsClick(news.slug)}>
            <img src={news.thumbnail_url} alt="News thumbnail" className="hotnews-thumbnail" />
            <div className="hotnews-text">
              <span className="hotnews-close" onClick={handleClose}>X</span>
              <p><strong>{news.title}</strong></p>
              <p className="hotnews-date">Published: {new Date(news.published_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HotNews;
