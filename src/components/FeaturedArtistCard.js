// FeaturedArtistCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify'; // For sanitizing HTML
import '../style/FeaturedArtistCard.css'; // Make sure you have this CSS file

const FeaturedArtistCard = ({ artist }) => {
  return (
    <section className="artist-feature">
     
      <div className="artist-card-container"> {/* Added container */}
        <div className="artist-card">
          <img src={artist.image_url} alt={artist.name} className="artist-card-image" />
          <h3>{artist.name}</h3>
          <p
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(artist.bio.substring(0, 150)), // Limit bio to 150 characters
            }}
          ></p>
          <Link to={`/artistbio/${artist.name}`}>Read More</Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtistCard;
