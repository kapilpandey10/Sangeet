import { useEffect, useState } from 'react';

const useDetectDevTools = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Utility to detect mobile devices
  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    // Skip detection if it's a mobile device
    if (isMobileDevice()) {
      return;
    }

    const threshold = 160; // Approx height/width of DevTools pane

    const checkDevTools = () => {
      // If the difference between outer and inner width/height is greater than threshold, DevTools are open
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
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
