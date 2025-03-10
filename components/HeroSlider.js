import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { useSwipeable } from 'react-swipeable';
import styles from './style/HeroSlider.module.css';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [showDescription, setShowDescription] = useState(false);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slider')
        .select('title, subtitle, image_url, description')
        .eq('status', 'approved');

      if (!error) setSlides(data);
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  useEffect(() => {
    if (slides.length < 2 || !autoSlide) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, autoSlide]);

  const navigate = (direction) => {
    setCurrentIndex(prev => 
      (prev + direction + slides.length) % slides.length
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => navigate(1),
    onSwipedRight: () => navigate(-1)
  });

  if (!slides.length) return null;

  return (
    <div 
      {...handlers}
      className={styles.wrapper}
      onMouseEnter={() => setAutoSlide(false)}
      onMouseLeave={() => setAutoSlide(true)}
    >
      <div className={styles.container}>
        <div 
          className={styles.slides}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className={styles.slide}>
              <Image
                src={slide.image_url}
                alt={`${slide.title} - ${slide.subtitle}`}
                fill
                priority
                className={styles.image}
              />
              <div className={styles.gradient} />
              <div className={styles.content}>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
              <button 
                className={styles.infoButton}
                onClick={() => setShowDescription(true)}
                aria-label="Show description"
              >
                ℹ️
              </button>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button 
              className={styles.navButton} 
              onClick={() => navigate(-1)}
              aria-label="Previous slide"
            >‹</button>
            <button 
              className={`${styles.navButton} ${styles.next}`} 
              onClick={() => navigate(1)}
              aria-label="Next slide"
            >›</button>
            
            <div className={styles.dots}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === currentIndex ? styles.active : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {showDescription && (
          <dialog className={styles.modal} open>
            <div className={styles.modalContent}>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDescription(false)}
                aria-label="Close description"
              >×</button>
              <h2>{slides[currentIndex].title}</h2>
              <p>{slides[currentIndex].description}</p>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;