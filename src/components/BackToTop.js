import React, { useEffect, useState } from 'react';
import '../style/BackToTop.css';

const BackToTop = () => {
  const [show, setShow] = useState(false);

  const checkScrollTop = () => {
    console.log("Window Scroll Y:", window.pageYOffset); // Check if scroll event is firing
    if (window.pageYOffset > 400) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const scrollTop = () => {
    console.log("Scroll to top triggered"); // Confirm the button is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    console.log("BackToTop component mounted"); // Check if component mounts
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, []);

  return (
    <div className={`back-to-top ${show ? 'show' : ''}`} onClick={scrollTop}>
      ↑
    </div>
  );
};

export default BackToTop;
