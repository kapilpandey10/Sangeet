import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { useSwipeable } from 'react-swipeable';
import styles from './style/HeroSlider.module.css';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showReadMore, setShowReadMore] = useState(true);
  const [autoSlide, setAutoSlide] = useState(true);

  // Fetch hero slider data including the description column
  const fetchSlides = async () => {
    setLoading(true);
    try {
      const { data: heroSlides, error } = await supabase
        .from('hero_slider')
        .select('title, subtitle, image_url, description, status')
        .eq('status', 'approved');

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
    fetchSlides();
  }, []);

  useEffect(() => {
    let interval;
    if (autoSlide && slides.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Slide every 5 seconds
    }
    return () => clearInterval(interval);
  }, [slides.length, autoSlide]);

  useEffect(() => {
    if (showReadMore) {
      const timer = setTimeout(() => {
        setShowReadMore(false);
      }, 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showReadMore]);

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

  const toggleDescription = () => {
    setShowDescription(!showDescription);
    setAutoSlide(!showDescription); // Pause auto slide when description is open
    setShowReadMore(false); // Hide the read more text if dialog opens
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
  });

  if (loading || slides.length === 0) {
    return null; // Hide the slider if there are no slides
  }

  return (
    <div
      className={styles.sliderHeroSliderWrapper}
      onMouseEnter={() => setAutoSlide(false)}
      onMouseLeave={() => setAutoSlide(true)}
      {...handlers}
    >
      <div className={styles.sliderHeroSlider}>
        <div className={styles.sliderContainer} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={index} className={`${styles.sliderSlide} ${index === currentIndex ? styles.sliderActive : ''}`}>
              <Image
                src={slide.image_url}
                alt={slide.title}
                layout="fill"
                objectFit="cover"
                priority
                className={styles.sliderImage}
              />
              <div className={styles.sliderGradientOverlay}></div>
              <div className={styles.sliderContent}>
                <h1 className={styles.sliderTitle}>{slide.title}</h1>
                <p className={styles.sliderSubtitle}>{slide.subtitle}</p>
              </div>
              <button className={styles.sliderInfoIcon} onClick={toggleDescription}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="white"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </button>
              {showReadMore && <div className={styles.sliderReadMore}>Read more about this</div>}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button className={styles.sliderPrev} onClick={handlePrev}>&#10094;</button>
            <button className={styles.sliderNext} onClick={handleNext}>&#10095;</button>
          </>
        )}

        <div className={styles.sliderDots}>
          {slides.map((slide, index) => (
            <span
              key={index}
              className={`${styles.sliderDot} ${index === currentIndex ? styles.sliderActiveDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              style={{ backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover' }}
            ></span>
          ))}
        </div>

        {showDescription && (
          <div className={styles.sliderDescriptionOverlay}>
            <div className={styles.sliderDescriptionContent}>
              <button className={styles.sliderCloseButton} onClick={toggleDescription}>
                &times;
              </button>
              <h2>Description</h2>
              <p>{slides[currentIndex].description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
