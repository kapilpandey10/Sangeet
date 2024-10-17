import { useEffect, useState } from 'react';
import MobileDetect from 'mobile-detect';

const useDetectDevTools = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Utility to detect mobile devices using mobile-detect package
  const isMobileDevice = () => {
    const md = new MobileDetect(window.navigator.userAgent);
    const isMobile = !!md.mobile();
    console.log(`Device detected as mobile: ${isMobile}`);
    return isMobile;
  };

  useEffect(() => {
    // Skip detection if it's a mobile device
    if (isMobileDevice()) {
      console.log('Skipping DevTools detection on mobile');
      return;
    }

    const threshold = 160; // Approx height/width of DevTools pane

    const checkDevTools = () => {
      // If the difference between outer and inner width/height is greater than threshold, DevTools are open
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        console.log('DevTools detected as open');
        setIsDevToolsOpen(true); // Set state to true if DevTools are open
      } else {
        setIsDevToolsOpen(false); // Set state to false if DevTools are closed
      }
    };

    // Check DevTools state every 500ms
    const interval = setInterval(checkDevTools, 500);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  return isDevToolsOpen; // Return the current state of DevTools (true if open, false otherwise)
};

export default useDetectDevTools;
