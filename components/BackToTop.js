import { useEffect, useState } from 'react';
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
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.arrowIcon}
      >
        <path
          d="M12 18V6M6 12l6-6 6 6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default BackToTop;
