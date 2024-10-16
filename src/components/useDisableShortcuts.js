import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  // Utility to detect mobile devices
  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    const handleContextMenu = (e) => {
      // Prevent right-click menu only on non-mobile devices
      if (!isMobileDevice()) {
        e.preventDefault();
        setShowWarning(true);
      }
    };

    const handleKeyDown = (e) => {
      // Block DevTools shortcuts only for non-mobile devices
      if (!isMobileDevice() && (
        e.keyCode === 123 || // F12 (Windows)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (Windows)
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C (macOS)
        (e.metaKey && e.keyCode === 85) // Cmd+U (macOS)
      )) {
        e.preventDefault();
        setShowWarning(true);
      }
    };

    const handleTouchStart = (e) => {
      // Do not trigger warnings for touch events (long press) on mobile devices
      if (isMobileDevice()) {
        return; // Skip any touch-based events on mobile
      }
    };

    document.addEventListener('contextmenu', handleContextMenu); // Prevent right-click
    document.addEventListener('keydown', handleKeyDown); // Prevent shortcuts on non-mobile
    document.addEventListener('touchstart', handleTouchStart); // Prevent warnings for long-press on mobile

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return [showWarning, setShowWarning];
};

export default useDisableShortcuts;
