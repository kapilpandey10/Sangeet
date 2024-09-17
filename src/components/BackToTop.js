import React, { useEffect, useState } from 'react';
import '../style/BackToTop.css';

const BackToTop = () => {
  const [show, setShow] = useState(false);

  // Log scroll events to check if it's firing
  const checkScrollTop = () => {
    console.log("Window Scroll Y:", window.pageYOffset);  // For debugging
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
    console.log("Adding scroll event listener");
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      console.log("Removing scroll event listener");
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
