import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaPlay } from 'react-icons/fa';
import styles from './style/AppleRadio.module.css';

const RadioDiscovery = ({ stations }) => {
  const [search, setSearch] = useState('');
  
  const featured = stations.slice(0, 3);
  const others = stations.slice(3);

  const filtered = stations.filter(s => 
    s.radioname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.applePage}>
      <Head>
        <title>Radio | DynaBeat</title>
      </Head>

      <header className={styles.navHeader}>
        <div className={styles.navInner}>
          <h1>Radio</h1>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Stations" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {search ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Search Results</h2>
            <div className={styles.compactGrid}>
              {filtered.map(s => <StationCard key={s.slug} station={s} />)}
            </div>
          </section>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Featured Stations</h2>
              <div className={styles.featuredSlider}>
                {featured.map(s => (
                  <Link href={`/radio/${s.slug}`} key={s.slug} className={styles.featuredCard}>
                    <img src={s.logo_url || '/logo/logo.webp'} alt={s.radioname} className={styles.featuredImg} />
                    <div className={styles.featuredOverlay}>
                      <span className={styles.liveLabel}>LIVE</span>
                      <h3>{s.radioname}</h3>
                      <p>{s.frequency} MHz</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>All Stations</h2>
              <div className={styles.compactGrid}>
                {others.map(s => <StationCard key={s.slug} station={s} />)}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const StationCard = ({ station }) => (
  <Link href={`/radio/${station.slug}`} className={styles.stationCard}>
    <div className={styles.cardThumb}>
      <img src={station.logo_url || '/logo/logo.webp'} alt={station.radioname} />
    </div>
    <div className={styles.cardInfo}>
      <h4>{station.radioname}</h4>
      <p>{station.frequency} MHz</p>
    </div>
  </Link>
);

export const getServerSideProps = async () => {
  const { data } = await supabase
    .from('radio')
    .select('*')
    .eq('status', 'online')
    .order('radioname', { ascending: true });

  return { props: { stations: data || [] } };
};

export default RadioDiscovery;