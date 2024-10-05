import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust based on your file structure
import { Link } from 'react-router-dom';
import { FaMusic } from 'react-icons/fa'; // Import music icon
import '../style/SearchResults.css'; // Import the associated CSS

const SearchResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lyricsResults, setLyricsResults] = useState([]);
  const [blogResults, setBlogResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLoading(true);
      setError(null);

      try {
        // Search in lyrics table: title, artist, lyrics (case-insensitive)
        const { data: lyricsData, error: lyricsError } = await supabase
          .from('lyrics')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%,lyrics.ilike.%${searchTerm}%`);

        if (lyricsError) throw lyricsError;

        // Search in blogs table: title, content (case-insensitive)
        const { data: blogData, error: blogError } = await supabase
          .from('blogs')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);

        if (blogError) throw blogError;

        setLyricsResults(lyricsData || []);
        setBlogResults(blogData || []);

      } catch (err) {
        console.error('Search Error:', err.message);  // Debugging: Log the general error
        setError('An error occurred while searching. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="search-results-container">
      <h2>Search Music Lyrics and Blogs</h2>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search for lyrics or blogs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* Results Section */}
      <div className="results-section">
        {lyricsResults.length > 0 && (
          <div className="music-results">
            <h3>Lyrics Results</h3>
            <ul>
              {lyricsResults.map((lyric) => (
                <li key={lyric.slug}>
                  <Link to={`/lyrics/${lyric.slug}`} className="music-link">
                    <FaMusic className="music-icon" /> {/* Music Icon */}
                    <div>
                      <strong>{lyric.title}</strong> by {lyric.artist}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {blogResults.length > 0 && (
          <div className="blog-results">
            <h3>Blog Results</h3>
            <ul>
              {blogResults.map((blog) => (
                <li key={blog.slug} className="blog-item">
                  <Link to={`/blogs/${blog.slug}`} className="blog-link">
                    {/* Blog Thumbnail */}
                    {blog.thumbnail_url && (
                      <img
                        src={blog.thumbnail_url}
                        alt={blog.title}
                        className="blog-thumbnail"
                      />
                    )}
                    <div className="blog-details">
                      <strong>{blog.title}</strong>
                      <p>{blog.excerpt.substring(0, 100)}...</p> {/* Excerpt */}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display message if no results */}
        {lyricsResults.length === 0 && blogResults.length === 0 && !loading && (
          <p>No results found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
