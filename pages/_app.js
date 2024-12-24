import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';  // Ensure the path is correct


const Navbar = dynamic(() => import('../components/Navbar'));
const Footer = dynamic(() => import('../components/Footer'));
const BackToTop = dynamic(() => import('../components/BackToTop'), { ssr: false });
const WarningModal = dynamic(() => import('../components/WarningModal'), { ssr: false });

import Onscreen from '../components/Onscreen';


// Google Analytics tracking ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const [showBackToTop, setShowBackToTop] = useState(false); // Track scroll position for BackToTop button

  useEffect(() => {
    setIsClient(true); // Set to true after the component has mounted on the client

    // Scroll event listener for BackToTop visibility
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Google Analytics page view tracking in production only
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      const handleRouteChange = (url) => {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      };

      router.events.on('routeChangeComplete', handleRouteChange);
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.events]);

  // Avoid rendering content until client-side hydration is complete
  if (!isClient) {
    return <div className="loading-spinner">Loading...</div>; // Add a loading indicator for hydration
  }

  return (
    <>
      <Head>
        {/* Basic SEO meta tags */}
        <title>DynaBeat - Find the Latest Nepali Music Lyrics & Blogs</title>
        <meta name="description" content=" All in one place for Lyrics and News" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="DynaBeat- Doko for the News and Music" />
        <meta property="og:description" content="Find the lyrics of Music, blogs and more." />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <meta property="og:url" content="https://pandeykapil.com.np" />
       
        {/* Preload important fonts */}
        <link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
      </Head>
      <Onscreen />
     
      {/* Navbar component displayed on all pages */}
      <Navbar />

      {/* Back to top button, visible only when scrolled down */}
      {showBackToTop && <BackToTop />}

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
