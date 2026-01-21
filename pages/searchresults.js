import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import { FaSearch, FaMusic, FaBookOpen, FaHistory } from 'react-icons/fa';
import styles from '../styles/SearchResults.module.css';

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lyricsResults, setLyricsResults] = useState([]);
  const [blogResults, setBlogResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Real-time Live Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
      } else {
        setLyricsResults([]);
        setBlogResults([]);
      }
    }, 400); // 400ms debounce to prevent API spam

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Advanced Query: Search by Title OR Artist for similar music results
      const { data: lyricsData } = await supabase
        .from('lyrics')
        .select('id, title, artist, slug, thumbnail_url')
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
        .limit(10);

      const { data: blogData } = await supabase
        .from('blogs')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      setLyricsResults(lyricsData || []);
      setBlogResults(blogData || []);
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Head>
        <title>Search Nepali Lyrics & Blogs | DynaBeat</title>
      </Head>

      <header className={styles.searchHeader}>
        <h1 className={styles.heading}>Find Your <span>Beat.</span></h1>
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search lyrics, artists, or stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          {loading && <div className={styles.loader}></div>}
        </div>
      </header>

      <main className={styles.resultsArea}>
        {/* Real-time Lyrics & Similar Music */}
        {lyricsResults.length > 0 && (
          <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}><FaMusic /> Music & Lyrics</h2>
            <div className={styles.resultsGrid}>
              {lyricsResults.map((lyric) => (
                <Link href={`/viewlyrics/${lyric.slug}`} key={lyric.id} className={styles.resultCard}>
                  <img src={lyric.thumbnail_url || '/logo/logo.webp'} alt={lyric.title} />
                  <div className={styles.cardContent}>
                    <h3>{lyric.title}</h3>
                    <p>{lyric.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Blog Results */}
        {blogResults.length > 0 && (
          <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}><FaBookOpen /> Stories & Blogs</h2>
            <div className={styles.blogList}>
              {blogResults.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className={styles.blogItem}>
                  <div>
                    <h3>{blog.title}</h3>
                    <span>By {blog.author}</span>
                  </div>
                  <FaHistory />
                </Link>
              ))}
            </div>
          </section>
        )}

        {searchQuery.length > 1 && !loading && lyricsResults.length === 0 && blogResults.length === 0 && (
          <div className={styles.noResults}>
            <p>No matches found for "<strong>{searchQuery}</strong>".</p>
            <span>Try searching for an artist name or a different keyword.</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;