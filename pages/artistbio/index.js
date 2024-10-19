import React, { useEffect, useState } from 'react';
import Head from 'next/head'; // Use Next.js Head for SEO meta tags
import DOMPurify from 'dompurify'; // To sanitize HTML
import Link from 'next/link'; // Use Next.js Link component
import styles from './style/Artistlist.module.css'; // Import your CSS
import { supabase } from '../../supabaseClient'; // Import from the centralized supabaseClient file

const Artistlist = () => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      let { data: artist, error } = await supabase
        .from('artists')  // Use correct table name
        .select('name, image_url, bio, video_url, status')
        .eq('status', 'approved')  // Fetch only approved artists
        .order('name', { ascending: true });

      if (error) console.log('Error fetching artists:', error);
      else setArtists(artist);
    };

    fetchArtists();
  }, []);

  return (
    <div className={styles.artistListContainer}>
      {/* SEO Meta Tags */}
      <Head>
        <title>Artist Contribution to the Music Industry of Nepal</title>
        <meta
          name="description"
          content="Explore the invaluable contributions of Nepali artists to the music industry, including prominent figures such as Anju Panta and Pashupati Sharma. Discover their impact on the vibrant music scene in Nepal."
        />
        <meta
          name="keywords"
          content="Nepali music artists, Nepal music industry, Anju Panta, Pashupati Sharma, Nepali singers, Nepali music, contemporary Nepali music"
        />
      </Head>

      {/* History Section */}
      <section className={styles.historySection}>
        <h1 className={styles.historyTitle}>History of Music in Nepal</h1>
        <img
          src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/channels4_profile.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yL2NoYW5uZWxzNF9wcm9maWxlLmpwZyIsImlhdCI6MTcyOTI0OTAyOCwiZXhwIjoxMzQ4Mzk2OTAyOH0.fWH0Ms2VBf0EYcTUcYo_P-VCG7zEAs4VmffaikZ5zyo&t=2024-10-18T10%3A57%3A08.334Z"
          alt="Radio Nepal Logo"
          className={styles.radioNepalLogo}
        />
        <p className={styles.historyText}>
          Nepali music has a rich and diverse history, and it all began with the establishment of <strong>Radio Nepal</strong> in 1951. Radio Nepal played a pivotal role in the development of music in Nepal, becoming the first platform for emerging artists to reach a nationwide audience.
          <br/><br/>
          Artists like <strong>Narayan Gopal</strong>, who is often referred to as the "Tragedy King" of Nepali music, and <strong>Laxmi Prasad Devkota</strong>, a legendary poet and writer, emerged from this era and became iconic figures in Nepali culture.
          <br/><br/>
          In the modern era, new artists such as <strong>Anju Panta</strong> and <strong>Pashupati Sharma</strong> have continued to build on this legacy.
        </p>
      </section>

      {/* Artist Cards Section */}
      <div className={styles.artistList}>
        {artists.length > 0 ? (
          artists.map((artist, index) => (
            <div key={index} className={styles.artistCard}>
              <img
                src={artist.image_url}
                alt={`Image of ${artist.name}`}
                className={styles.artistImage}
              />
              <h2 className={styles.artistName}>{artist.name}</h2>
              <p className={styles.artistBio}>
                {DOMPurify.sanitize(artist.bio, { USE_PROFILES: { html: false } }).slice(0, 120)}...
                <Link href={`/artistbio/${encodeURIComponent(artist.name)}`}>
                  <span className={styles.readMore}>Read more</span>
                </Link>
              </p>
            </div>
          ))
        ) : (
          <p>No artists found.</p>
        )}
      </div>
    </div>
  );
};

export default Artistlist;
