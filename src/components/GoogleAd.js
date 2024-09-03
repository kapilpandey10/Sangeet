import React, { useEffect } from 'react';

const GoogleAd = ({ adClient, adSlot, adFormat = 'auto', adStyle = {}, responsive = true }) => {
  useEffect(() => {
    if (window) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  return (
    <div style={adStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9887409333966239"
        data-ad-slot="6720877169"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleAd;
