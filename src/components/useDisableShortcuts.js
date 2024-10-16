import { useEffect, useState } from 'react';

const useDisableShortcuts = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowWarning(true); // Show the warning modal on right-click
    };

    const handleKeyDown = (e) => {
      // Disable common DevTools shortcuts for Windows and macOS
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U for Windows
      // Prevent Cmd+Option+I, Cmd+Option+J, Cmd+Shift+C for macOS
      if (
        e.keyCode === 123 || // F12 (Windows)
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or Ctrl+Shift+J (Windows)
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (Windows - View Page Source)
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or Cmd+Option+J (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 67) || // Cmd+Shift+C (macOS)
        (e.metaKey && e.keyCode === 85) || // Cmd+U (macOS)
        (e.metaKey && e.shiftKey && e.keyCode === 73) // Cmd+Shift+I (Safari)
      ) {
        e.preventDefault();
        setShowWarning(true); // Show the warning modal on key shortcuts
      }
    };

    document.addEventListener('contextmenu', handleContextMenu); // Disable right-click
    document.addEventListener('keydown', handleKeyDown); // Disable shortcuts

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return [showWarning, setShowWarning]; // Return both showWarning state and setter
};

export default useDisableShortcuts;
