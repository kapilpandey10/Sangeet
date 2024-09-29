import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import '../style/SearchResults.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const [lyricsResults, setLyricsResults] = useState([]);
  const [blogsResults, setBlogsResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery().get('query');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      // Fetch lyrics that match the query
      const { data: lyricsData, error: lyricsError } = await supabase
        .from('lyrics')
        .select('*')
        .or(`title.ilike.%${query}%,lyrics.ilike.%${query}%,artist.ilike.%${query}%`);

      if (lyricsError) {
        console.error('Error fetching lyrics search results:', lyricsError);
      } else {
        setLyricsResults(lyricsData);
      }

      // Fetch blogs that match the query
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,author.ilike.%${query}%`);

      if (blogsError) {
        console.error('Error fetching blogs search results:', blogsError);
      } else {
        setBlogsResults(blogsData);
      }

      setLoading(false);
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (loading) {
    return <p>Loading search results...</p>;
  }

  return (
    <div className="search-results-container">
      <h1>Search Results for "{query}"</h1>
      
      {lyricsResults.length > 0 && (
        <>
          <h2>Lyrics</h2>
          <ul>
            {lyricsResults.map((lyric) => (
              <li key={lyric.id}>
                <h3>{lyric.title}</h3>
                <p>Artist: {lyric.artist}</p>
                {/* Use the slug field for the lyrics URL */}
                <p><a href={`/lyrics/${lyric.slug}`}>View Lyrics</a></p> {/* Uses slug column */}
              </li>
            ))}
          </ul>
        </>
      )}

      {blogsResults.length > 0 && (
        <>
          <h2>Blogs</h2>
          <ul>
            {blogsResults.map((blog) => (
              <li key={blog.id}>
                <h3>{blog.title}</h3>
                <p>Author: {blog.author}</p>
                {/* Use the slug field for the blog URL */}
                <p><a href={`/blogs/${blog.slug}`}>Read Blog</a></p> {/* Uses slug column */}
              </li>
            ))}
          </ul>
        </>
      )}

      {lyricsResults.length === 0 && blogsResults.length === 0 && (
        <p>No results found for "{query}". Please try different keywords.</p>
      )}
    </div>
  );
};

export default SearchResults;
