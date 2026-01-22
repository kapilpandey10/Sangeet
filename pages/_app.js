import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react"; // Integrated Vercel Analytics
import Onscreen from '../components/Onscreen';
import '../styles/globals.css';

// Dynamic imports for better performance
const Navbar = dynamic(() => import('../components/Navbar'));
const Footer = dynamic(() => import('../components/Footer'));
const BackToTop = dynamic(() => import('../components/BackToTop'), { ssr: false });

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 1. Detect if the user is on an Admin page
  const isAdminPage = router.pathname.startsWith('/Admin');

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300); // Trigger at 300px for better UX
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Optimized Google Analytics Logic
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      const handleRouteChange = (url) => {
        window.gtag('config', GA_TRACKING_ID, { page_path: url });
      };
      router.events.on('routeChangeComplete', handleRouteChange);
      return () => router.events.off('routeChangeComplete', handleRouteChange);
    }
  }, [router.events]);

  // Prevent flash of unstyled content during hydration
  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>DynaBeat | Nepali Music News & Lyrics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="The pulse of Nepali music. Find lyrics, news, and exclusive stories." />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <link rel="canonical" href={`https://pandeykapil.com.np${router.asPath}`} />
      </Head>

      {/* Global Elements: Hidden on Admin Pages */}
      {!isAdminPage && (
        <>
          <Onscreen />
          <Navbar />
          {showBackToTop && <BackToTop />}
        </>
      )}

      {/* Main Content Area */}
      <main className={isAdminPage ? "admin-viewport" : "site-viewport"}>
        <Component {...pageProps} />
      </main>

      {/* Global Footer: Hidden on Admin Pages */}
      {!isAdminPage && <Footer />}

      <Analytics />
    </>
  );
}

export default MyApp;