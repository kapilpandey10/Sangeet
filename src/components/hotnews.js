import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure your Supabase client is correctly imported
import '../style/hotnews.css';

const HotNews = () => {
  const [news, setNews] = useState(null); // Holds the current news being displayed
  const [showOverlay, setShowOverlay] = useState(false); // Controls the visibility of the overlay
  const [closing, setClosing] = useState(false); // Track if the overlay is closing
  const [newsList, setNewsList] = useState([]); // Holds the list of fetched news from the blogs table
  const [newsIndex, setNewsIndex] = useState(0); // Keeps track of the current news index
  const [userClosed, setUserClosed] = useState(false); // Track if the user manually closed the news

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
          setNewsList(blogs); // Store the fetched blogs in newsList state
        } else {
          console.log('No news data available');
        }
      }
    } catch (err) {
      console.error('Error during fetchNews:', err);
    }
  };

  useEffect(() => {
    fetchNews(); // Fetch news when the component mounts
  }, []);

  useEffect(() => {
    if (newsList.length > 0) {
      const showFirstNews = setTimeout(() => {
        console.log('Displaying first news:', newsList[newsIndex]);
        setNews(newsList[newsIndex]);
        setShowOverlay(true); // Show the first news after 5 seconds
        setUserClosed(false); // Reset user-closed status
      }, 5000); // Show first news 5 seconds after page load

      // Auto-close the news after 6 seconds of being shown
      const autoCloseNews = setTimeout(() => {
        if (!userClosed) {
          closeOverlay(); // Close the news automatically after 6 seconds
        }
      }, 11000); // 5 seconds (initial delay) + 6 seconds (news displayed)

      return () => {
        clearTimeout(showFirstNews);
        clearTimeout(autoCloseNews);
      };
    }
  }, [newsList, newsIndex, userClosed]);

  const closeOverlay = () => {
    setClosing(true); // Start closing animation
    setTimeout(() => {
      setShowOverlay(false); // Hide the overlay
      setClosing(false); // Reset closing state
      setUserClosed(true); // Mark that user has closed the news
      setTimeout(() => {
        setNewsIndex((prevIndex) => (prevIndex + 1) % newsList.length); // Show the next news after 10 seconds
      }, 10000); // Show the next news 10 seconds after closing the previous one
    }, 400); // 400ms matches the CSS animation duration
  };

  const handleNewsClick = (slug) => {
    const blogUrl = `https://pandeykapil.com.np/blogs/${slug}`;
    window.location.href = blogUrl; // Redirect to the blog page on click
  };

  return (
    <>
      {showOverlay && news && (
        <div className={`hotnews-overlay ${showOverlay ? 'show' : ''} ${closing ? 'closing' : ''}`}>
          <div className="hotnews-content" onClick={() => handleNewsClick(news.slug)}>
            <img src={news.thumbnail_url} alt="News thumbnail" className="hotnews-thumbnail" />
            <div className="hotnews-text">
              <span className="hotnews-close" onClick={closeOverlay}>X</span>
              <p className="hotnews-title">{news.title}</p>
              <p className="hotnews-date">Published: {new Date(news.published_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HotNews;
