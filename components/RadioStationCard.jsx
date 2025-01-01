// File: components/RadioStationCard.jsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBroadcastTower } from 'react-icons/fa';
import styles from './RadioStationCard.module.css';

// List of allowed image domains
const allowedImageDomains = [
  'cdn.onlineradiobox.com',
  'unncdn.prixacdn.net',
  // Add other domains as needed
];

// Helper function to check if the image is from an allowed domain
const isAllowedDomain = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return allowedImageDomains.includes(hostname);
  } catch (error) {
    console.error('Invalid URL:', url);
    return false;
  }
};

const RadioStationCard = ({ station }) => {
  const { slug, logo_url, radioname, frequency, city, country } = station;

  return (
    <Link href={`/radio/${slug}`} className={styles.stationCard}>
      <div className={styles.logoContainer}>
        {logo_url ? (
          isAllowedDomain(logo_url) ? (
            <Image
              src={logo_url}
              alt={`${radioname} Logo`}
              width={100}
              height={100}
              className={styles.stationLogo}
              loading="lazy"
            />
          ) : (
            <img
              src={logo_url}
              alt={`${radioname} Logo`}
              className={styles.stationLogo}
              loading="lazy"
            />
          )
        ) : (
          <div className={styles.noLogo}>
            <FaBroadcastTower size={40} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className={styles.stationInfo}>
        <h2 className={styles.stationName}>{radioname}</h2>
        <p className={styles.frequency}>{frequency} MHz</p>
        <p className={styles.location}>{city}, {country}</p>
      </div>
    </Link>
  );
};

export default RadioStationCard;
