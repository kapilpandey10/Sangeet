import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase client
import '../style/FtAnthem.css'; // Create and style the CSS file for the component
import { useParams } from 'react-router-dom'; // To retrieve the country name from URL

const FtAnthem = () => {
  const { country } = useParams(); // Get the country name from the URL
  const [anthemData, setAnthemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debugging: Log the country parameter to see if it's being passed correctly
  useEffect(() => {
    console.log('Country parameter:', country);  // This will help you see the country value in the console

    if (!country) {
      setError('Country is not defined.');
      setLoading(false);
      return;
    }

    const fetchAnthem = async () => {
      try {
        // Convert country name to lowercase and remove spaces
        const formattedCountry = country.trim().toLowerCase();

        const { data, error } = await supabase
          .from('Anthem')  // Ensure table name is correct
          .select('*')
          .ilike('CountryName', `%${formattedCountry}%`) // Case-insensitive query, allowing for partial matches
          .single(); // Expect only one anthem per country

        if (error || !data) {
          throw new Error('Failed to load the anthem for this country.');
        }

        setAnthemData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnthem();
  }, [country]);

  if (loading) return <p>Loading national anthem for {country}...</p>;
  if (error) return <p>{error}</p>;

  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url?.match(regex);
    return matches ? matches[1] : null;
  };

  const videoId = extractYouTubeId(anthemData?.Video);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <div className="anthem-container">
      {/* Flag Section */}
      <div className="flag-section">
        <img
          src={`https://flagcdn.com/80x60/${country?.toLowerCase().replace(/\s+/g, '-')}.png`} // Dynamically load the flag image from a public flag API
          alt={`Flag of ${country}`}
          className="country-flag"
        />
      </div>

      {/* Video and Lyrics Section */}
      <div className="anthem-content">
        <h2>National Anthem of {country}</h2>
        <pre className="lyrics-text">{anthemData?.Lyrics}</pre>

        {/* Video Embed */}
        {embedUrl && (
          <div className="video-container">
            <iframe
              width="100%"
              height="315"
              src={embedUrl}
              title={`National Anthem of ${country}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default FtAnthem;
