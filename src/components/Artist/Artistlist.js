import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet'; // For SEO meta tags
import DOMPurify from 'dompurify'; // To sanitize HTML
import './style/Artistlist.css'; // Import your CSS
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
    <div className="artist-list-container">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Artist Contribution to the Music Industry of Nepal</title>
        <meta name="description" content="Explore the invaluable contributions of Nepali artists to the music industry, including prominent figures such as Anju Panta and Pashupati Sharma. Discover their impact on the vibrant music scene in Nepal." />
        <meta name="keywords" content="Nepali music artists, Nepal music industry, Anju Panta, Pashupati Sharma, Nepali singers, Nepali music, contemporary Nepali musi, Sangeet Lyrics central, Sangeet Lyrics, Sangeet Lyrics Nepali, Nepali Song lyrics" />
      </Helmet>
      <section className="history-section">
        <h1 className="history-title">History of Music in Nepal</h1>
        <img src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/channels4_profile.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yL2NoYW5uZWxzNF9wcm9maWxlLmpwZyIsImlhdCI6MTcyNTk2NzI1OSwiZXhwIjoxMDY2NDYxMDc0NDU5fQ.yhnWtgbfE8Gd4bUOHiR3U8lXFXRPyjm0T75qOL8alWE&t=2024-09-10T11%3A20%3A59.402Z" alt="Radio Nepal Logo" className="radio-nepal-logo" />
        <p className="history-text">
          Nepali music has a rich and diverse history, and it all began with the establishment of <strong>Radio Nepal</strong> in 1951. Radio Nepal played a pivotal role in the development of music in Nepal, becoming the first platform for emerging artists to reach a nationwide audience. <br/><br/>
          Artists like <strong>Narayan Gopal</strong>, who is often referred to as the "Tragedy King" of Nepali music, and <strong>Laxmi Prasad Devkota</strong>, a legendary poet and writer, emerged from this era and became iconic figures in Nepali culture. Narayan Gopal's deep and emotive voice captured the hearts of many, while Laxmi Prasad Devkota's poetic works influenced generations of Nepali musicians and writers. <br/><br/>
          In the modern era, new artists such as <strong>Anju Panta</strong> and <strong>Pashupati Sharma</strong> have continued to build on this legacy, combining traditional Nepali sounds with contemporary influences to reach both national and international audiences.
        </p>
      </section>

      {/* Artist Cards Section */}
      <div className="artist-list">
        {artists.length > 0 ? (
          artists.map((artist, index) => (
            <div key={index} className="artist-card">
              <img 
                src={artist.image_url} 
                alt={`Image of ${artist.name}`} 
                className="artist-image" 
              />
              <h2 className="artist-name">{artist.name}</h2>
              <p className="artist-bio">
                {/* Use DOMPurify to sanitize and strip HTML tags from the bio */}
                {DOMPurify.sanitize(artist.bio, { USE_PROFILES: { html: false } }).slice(0, 150)}...
                <a href={`/artistbio/${artist.name}`} className="read-more">Read more</a>
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
