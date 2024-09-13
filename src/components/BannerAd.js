import React from 'react';

const BannerAd = ({ adScript, noscriptTag }) => {
  return (
    <div>
      {/* Inject the script using dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: adScript }} />
      <noscript dangerouslySetInnerHTML={{ __html: noscriptTag }} />
    </div>
  );
};

export default BannerAd;
