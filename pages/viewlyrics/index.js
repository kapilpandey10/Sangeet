import { useState, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FaSearch, FaGoogle, FaFire, FaRandom } from 'react-icons/fa'; // Changed FaShuffle to FaRandom
import styles from './style/LyricsList.module.css';

const LyricsLibrary = ({ allLyrics }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Discovery Logic: Top Searches and Random Picks
  const topSearches = useMemo(() => (allLyrics ? allLyrics.slice(0, 12) : []), [allLyrics]);
  const randomDiscovery = useMemo(() => 
    allLyrics ? [...allLyrics].sort(() => 0.5 - Math.random()).slice(0, 5) : [], 
  [allLyrics]);

  const filteredLyrics = allLyrics.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.libraryContainer}>
      <Head>
        <title>DynaBeat Library | Explore Nepali Lyrics</title>
      </Head>

      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Your <span>Music</span> Library</h1>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for songs, artists, or eras..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {!searchTerm ? (
          <>
            {/* Top Searches Section */}
            <section className={styles.sectionArea}>
              <h2 className={styles.sectionTitle}><FaFire color="#ff0055" /> Top Searches This Week</h2>
              <div className={styles.spotifyGrid}>
                {topSearches.map((song) => (
                  <Link href={`/viewlyrics/${song.slug}`} key={song.slug} className={styles.musicCard}>
                    <div className={styles.thumbBox}>
                      <Image 
                        src={song.thumbnail_url?.trim() || '/logo/logo.webp'} 
                        alt={song.title} 
                        width={200} height={200} 
                        className={styles.cardImg} 
                      />
                      <div className={styles.playBtn}><span>▶</span></div>
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.songTitle}>{song.title}</h3>
                      <p className={styles.artistName}>{song.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Random Discovery Section */}
            <section className={styles.sectionArea}>
              <h2 className={styles.sectionTitle}><FaRandom color="#6366f1" /> Quick Discovery</h2>
              <div className={styles.horizontalScroll}>
                {randomDiscovery.map((song) => (
                  <Link href={`/viewlyrics/${song.slug}`} key={song.slug} className={styles.compactRow}>
                    <Image 
                      src={song.thumbnail_url?.trim() || '/logo/logo.webp'} 
                      alt={song.title} width={60} height={60} 
                      className={styles.miniThumb} 
                    />
                    <div className={styles.miniInfo}>
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Search Results & Google Fallback */
          <section className={styles.sectionArea}>
            <h2 className={styles.sectionTitle}>Search Results</h2>
            <div className={styles.spotifyGrid}>
              {filteredLyrics.length > 0 ? (
                filteredLyrics.map((song) => (
                  <Link href={`/viewlyrics/${song.slug}`} key={song.slug} className={styles.musicCard}>
                    <div className={styles.thumbBox}>
                      <Image src={song.thumbnail_url?.trim() || '/logo/logo.webp'} alt={song.title} width={200} height={200} className={styles.cardImg} />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.songTitle}>{song.title}</h3>
                      <p className={styles.artistName}>{song.artist}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>We don't have "{searchTerm}" in our library yet.</p>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' lyrics')}`} 
                    target="_blank" rel="noreferrer" className={styles.googleBtn}
                  >
                    <FaGoogle /> Search "{searchTerm}" on Google
                  </a>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export const getStaticProps = async () => {
  try {
    const { data, error } = await supabase
      .from('lyrics')
      .select('title, artist, slug, thumbnail_url, status')
      .eq('status', 'approved')
      .order('published_date', { ascending: false });

    if (error) throw error;

    return {
      props: { allLyrics: data || [] },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return { props: { allLyrics: [] }, revalidate: 60 };
  }
};

export default LyricsLibrary;