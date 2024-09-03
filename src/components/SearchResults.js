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
  const [results, setResults] = useState([]);
  const query = useQuery().get('query');

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .or(`title.ilike.%${query}%,lyrics.ilike.%${query}%,artist.ilike.%${query}%`); // Combined or condition

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
              <p><a href={`/lyrics/${lyric.id}`}>View Lyrics</a></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found for "{query}".</p>
      )}
    </div>
  );
};

export default SearchResults;
