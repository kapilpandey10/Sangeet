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

// Function to generate URL slugs for title
const generateSlug = (title) => {
  return title.trim().replace(/\s+/g, '_').toLowerCase(); // Replaces spaces with underscores and converts to lowercase
};

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const query = useQuery().get('query');

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .or(`title.ilike.%${query}%,lyrics.ilike.%${query}%,artist.ilike.%${query}%`); // Combined OR condition

      if (error) {
        console.error('Error fetching search results:', error);
      } else {
        setResults(data);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  return (
    <div className="search-results-container">
      <h1>Search Results for "{query}"</h1>
      {results.length > 0 ? (
        <ul>
          {results.map((lyric) => (
            <li key={lyric.id}>
              <h2>{lyric.title}</h2>
              <p>{lyric.artist}</p>
              {/* Use the slug generation function to create dynamic URL */}
              <p><a href={`/lyrics/${generateSlug(lyric.title)}`}>View Lyrics</a></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found for "{query}". Please type different keywords.</p>
      )}
    </div>
  );
};

export default SearchResults;
