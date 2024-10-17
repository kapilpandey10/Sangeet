import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  // Utility to detect if the device is mobile
  const isDesktopDevice = () => {
    return !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    // Run only if the device is a desktop/laptop
    if (!isDesktopDevice()) {
      console.log('Skipping DevTools detection on mobile');
      return; // Exit early if on a mobile device
    }

    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowWarning(true); // Show the warning modal when right-click is used
    };

    const handleKeyDown = (e) => {
      // Block DevTools shortcuts on desktop devices only
      if (
        e.keyCode === 123 || // F12 (Windows/Chrome DevTools)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (View Source on Windows)
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C (Inspect Element on macOS)
        (e.metaKey && e.keyCode === 85) // Cmd+U (View Source on macOS)
      ) {
        e.preventDefault();
        setShowWarning(true); // Show warning when DevTools shortcuts are used
      }
    };

    document.addEventListener('contextmenu', handleContextMenu); // Block right-click
    document.addEventListener('keydown', handleKeyDown); // Block keyboard shortcuts

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return [showWarning, setShowWarning];
};

export default useDisableShortcuts;
