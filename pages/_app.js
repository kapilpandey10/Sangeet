import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';  // Ensure the path is correct
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import WarningModal from '../components/WarningModal';
import useDetectDevTools from '../components/useDetectDevTools';
import useDisableShortcuts from '../components/useDisableShortcuts';

// Google Analytics tracking ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Track client-side rendering

  useEffect(() => {
    setIsClient(true); // Set to true after the component has mounted on the client
  }, []);

  // Handle Google Analytics page view tracking
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Detect if DevTools are open
  const isDevToolsOpen = useDetectDevTools();

  // Handle blocking shortcuts and right-click
  const [showWarning, setShowWarning] = useDisableShortcuts();

  // Avoid rendering content until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Show Warning Modal if DevTools are open or if right-click/shortcuts are used */}
      {(isDevToolsOpen || showWarning) && <WarningModal />}

      {/* Navbar component displayed on all pages */}
      <Navbar />

      {/* Back to top button */}
      <BackToTop />

      {/* Main content area for all pages */}
      <div className="main-content">
        <Component {...pageProps} />
      </div>

      {/* Footer component displayed on all pages */}
      <Footer />
    </>
  );
}

export default MyApp;
