import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized Next.js image component
import { supabase } from '../supabaseClient'; // Your Supabase client setup
import styles from './style/HeroSlider.module.css'; // Import the updated CSS

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to fetch hero slider data from the Supabase 'hero_slider' table
  const fetchSlides = async () => {
    setLoading(true);
    try {
      const { data: heroSlides, error } = await supabase
        .from('hero_slider')
        .select('title, subtitle, image_url, status')
        .eq('status', 'approved'); // Only fetch approved slides

      if (error) {
        console.error('Error fetching hero slider data:', error.message);
      } else {
        setSlides(heroSlides);
      }
    } catch (error) {
      console.error('Error in fetchSlides:', error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides(); // Fetch slides when component mounts
  }, []);

  // Automatically cycle through slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval); // Clean up on unmount
  }, [slides.length]);

  // Navigation Handlers
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return <p>Loading Slider...</p>; // Show a loading state while fetching
  }

  return (
    <div className={styles.heroSlider}>
      <div className={styles.slider} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}>
            <Image
              src={slide.image_url}
              alt={slide.title}
              layout="fill"
              objectFit="cover"
              priority
              className={styles.sliderImage}
            />
            <div className={styles.slideContent}>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className={styles.prev} onClick={handlePrev}>
        &#10094;
      </button>
      <button className={styles.next} onClick={handleNext}>
        &#10095;
      </button>

      {/* Pagination Dots */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <span
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
