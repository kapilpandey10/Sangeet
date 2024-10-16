import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  // Utility to detect mobile devices
  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    if (isMobileDevice()) {
      // If it's a mobile device, do nothing to avoid blocking interaction
      return;
    }

    const handleContextMenu = (e) => {
      // Prevent right-click menu on desktop devices
      e.preventDefault();
      setShowWarning(true);
    };

    const handleKeyDown = (e) => {
      // Block DevTools shortcuts only on desktop devices
      if (
        e.keyCode === 123 || // F12 (Windows)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (Windows)
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C (macOS)
        (e.metaKey && e.keyCode === 85) // Cmd+U (macOS)
      ) {
        e.preventDefault();
        setShowWarning(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu); // Prevent right-click
    document.addEventListener('keydown', handleKeyDown); // Prevent shortcuts

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return [showWarning, setShowWarning];
};

export default useDisableShortcuts;
