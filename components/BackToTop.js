import React, { useEffect, useState } from 'react';
import styles from './style/BackToTop.module.css'; // Use CSS module

const BackToTop = () => {
  const [show, setShow] = useState(false);

  // Handle scroll event
  const checkScrollTop = () => {
    if (window.pageYOffset > 400) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, []);

  return (
    <div className={`${styles.backToTop} ${show ? styles.show : ''}`} onClick={scrollTop}>
      ⬆
    </div>
  );
};

export default BackToTop;
