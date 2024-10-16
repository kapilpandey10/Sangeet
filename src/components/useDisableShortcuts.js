import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowWarning(true); // Show the warning modal on right-click or long-press
    };

    const handleKeyDown = (e) => {
      // Disable common DevTools shortcuts for Windows and macOS
      if (
        e.keyCode === 123 || // F12 (Windows)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J (Windows)
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (Windows)
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C (macOS)
        (e.metaKey && e.keyCode === 85) || // Cmd+U (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 73) // Cmd+Shift+I (Safari)
      ) {
        e.preventDefault();
        setShowWarning(true);
      }
    };

    const handleTouchCallout = (e) => {
      // Prevent long-press in mobile browsers
      e.preventDefault();
      setShowWarning(true);
    };

    // Disable right-click (desktop and mobile long press)
    document.addEventListener('contextmenu', handleContextMenu);

    // Disable long press in mobile
    document.addEventListener('touchstart', handleTouchCallout);

    // Disable key shortcuts (Windows/macOS)
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('touchstart', handleTouchCallout);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return [showWarning, setShowWarning];
};

export default useDisableShortcuts;
