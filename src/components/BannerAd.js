import React, { useEffect, useRef } from 'react';

const BannerAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://udbaa.com/bnr.php?section=General&pub=343571&format=300x250&ga=g';
    adRef.current.appendChild(script);

    return () => {
      // Clean up the script when the component is unmounted
      if (adRef.current) {
        adRef.current.innerHTML = ''; // Clear the contents of the ad div
      }
    };
  }, []);

  return (
    <div className="banner-ad" ref={adRef}>
      <noscript>
        <a href="https://yllix.com/publishers/343571" target="_blank" rel="noopener noreferrer">
          <img
            src="//ylx-aff.advertica-cdn.com/pub/300x250.png"
            style={{ border: 'none', margin: '0', padding: '0', verticalAlign: 'baseline' }}
            alt="ylliX - Online Advertising Network"
          />
        </a>
      </noscript>
    </div>
  );
};

export default BannerAd;
