import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/FeaturedArtistCard.module.css';

const FeaturedArtistCard = ({ artist }) => {
  if (!artist) return null;

  return (
    <div className={styles.artistSpotlightCard}>
      <div className={styles.imageSection}>
        <div className={styles.glowRing}></div>
        <Image
          src={artist.image_url || '/logo/logo.webp'}
          alt={artist.name}
          width={400}
          height={400}
          className={styles.artistImg}
        />
      </div>
      
      <div className={styles.infoSection}>
        <span className={styles.label}>Featured Artist</span>
        <h2 className={styles.artistName}>{artist.name}</h2>
        <p className={styles.bio}>{artist.bio?.substring(0, 160)}...</p>
        
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>120+</span>
            <span className={styles.statLabel}>Lyrics</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>Verified</span>
            <span className={styles.statLabel}>Artist</span>
          </div>
        </div>

        <Link href={`/artistbio/${artist.name.toLowerCase().replace(/ /g, '-')}`} className={styles.exploreBtn}>
          View Full Biography
        </Link>
      </div>
    </div>
  );
};

export default FeaturedArtistCard;