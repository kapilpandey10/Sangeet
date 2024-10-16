import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent); // Detect mobile devices
  };

  useEffect(() => {
    const handleContextMenu = (e) => {
      if (!isMobileDevice()) { // Only show warning for non-mobile devices
        e.preventDefault();
        setShowWarning(true);
      }
    };

    const handleKeyDown = (e) => {
      // Block DevTools shortcuts only for non-mobile devices
      if (!isMobileDevice() && (
        e.keyCode === 123 || // F12 (Windows)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C
        (e.metaKey && e.keyCode === 85) // Cmd+U
      )) {
        e.preventDefault();
        setShowWarning(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return [showWarning, setShowWarning];
};

export default useDisableShortcuts;
