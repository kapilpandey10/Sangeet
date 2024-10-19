// File: pages/searchresults.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from '../styles/SearchResults.module.css'; // Import CSS Module

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lyricsResults, setLyricsResults] = useState([]);
  const [blogResults, setBlogResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch lyrics matching the search query
      const { data: lyricsData, error: lyricsError } = await supabase
        .from('lyrics')
        .select('*')
        .ilike('title', `%${searchQuery}%`);

      // Fetch blogs matching the search query
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .ilike('title', `%${searchQuery}%`);

      if (lyricsError || blogError) {
        throw new Error('Error fetching results');
      }

      setLyricsResults(lyricsData || []);
      setBlogResults(blogData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <h1 className={styles.heading}>Search Lyrics and Blogs</h1>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          required
        />
        <button type="submit" className={styles.searchButton} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.resultsContainer}>
        <h2>Lyrics Results</h2>
        {lyricsResults.length > 0 ? (
          <ul className={styles.resultsList}>
            {lyricsResults.map((lyric) => (
              <li key={lyric.id} className={styles.resultItem}>
                <h3>{lyric.title}</h3>
                <p>{lyric.artist}</p>
                <a href={`/lyrics/${lyric.slug}`} className={styles.resultLink}>
                  View Lyrics
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No lyrics found for "{searchQuery}".</p>
        )}

        <h2>Blog Results</h2>
        {blogResults.length > 0 ? (
          <ul className={styles.resultsList}>
            {blogResults.map((blog) => (
              <li key={blog.id} className={styles.resultItem}>
                <h3>{blog.title}</h3>
                <p>By {blog.author}</p>
                <a href={`/blog/${blog.slug}`} className={styles.resultLink}>
                  Read Blog
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No blogs found for "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
