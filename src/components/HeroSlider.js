
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/HeroSlider.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch hero slider data from Supabase
  const fetchSlides = async () => {
    setLoading(true);
    const { data: slidesData, error } = await supabase
      .from('hero_slider')
      .select('title, subtitle, image_url, status')
      .eq('status', 'approved'); // Only fetch approved slides

    if (error) {
      console.error('Error fetching hero slider:', error.message);
      setSlides([]);
    } else {
      // Filter out any slides with null image URLs or empty URLs
      const validSlides = slidesData.filter(
        (slide) => slide.image_url && slide.image_url.trim() !== ''
      );
      setSlides(validSlides);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Automatically cycle through slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [slides.length]);

  // Render the hero slider
  const renderSlide = (slide, index) => {
    return (
      <div
        key={index}
        className={`slide ${index === currentIndex ? 'active' : ''}`}
        aria-hidden={index !== currentIndex}
      >
        <img
          src={slide.image_url}
          alt={`${slide.title} - ${slide.subtitle}`}
          className="slide-image"
          loading="lazy"  // Lazy loading for better performance
          width="1200"  // Set explicit width and height to reduce layout shifts
          height="600"
          srcSet={`
            ${slide.image_url}?w=600 600w,
            ${slide.image_url}?w=1200 1200w,
            ${slide.image_url}?w=1800 1800w
          `}
          sizes="(max-width: 768px) 600px, (max-width: 1200px) 1200px, 1800px"
        />
        <div className="slide-content">
          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>
        </div>
      </div>
    );
  };

  // Navigate to the next or previous slide manually
  const handlePrev = () => {
    setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="hero-slider">
      {loading ? (
        <p>Loading Slider...</p>
      ) : (
        <>
          <div className="slider">
            {slides.length > 0 ? (
              slides.map((slide, index) => renderSlide(slide, index))
            ) : (
              <p>No slides available</p>
            )}
          </div>

          {/* Navigation buttons */}
          {slides.length > 1 && (
            <>
              <button className="prev" onClick={handlePrev}>
                &#10094;
              </button>
              <button className="next" onClick={handleNext}>
                &#10095;
              </button>
            </>
          )}

          {/* Pagination dots */}
          <div className="dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
