import React, { useEffect } from 'react'; // Import React

const MonetagAd = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://aupoafto.com/400/8086963';  // Your ad script URL
    script.async = true;

    try {
      (document.body || document.documentElement).appendChild(script);
    } catch (e) {
      console.error('Error appending Monetag script:', e);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);  // Clean up the script when component unmounts
      }
    };
  }, []);

  return null;  // No need to return anything visually
};

export default MonetagAd;
