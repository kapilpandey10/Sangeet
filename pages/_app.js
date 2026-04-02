import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react";
import Onscreen from '../components/Onscreen';
import '../styles/globals.css';

const Navbar    = dynamic(() => import('../components/Navbar'));
const Footer    = dynamic(() => import('../components/Footer'));
const BackToTop = dynamic(() => import('../components/BackToTop'), { ssr: false });

const GA_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [mounted, setMounted]           = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isAdminPage = router.pathname.startsWith('/Admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // passive:true lets the browser scroll/paint without waiting for your handler
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Guard against GA_ID being undefined; optional chain on gtag for late loads
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !GA_ID) return;
    const handleRouteChange = (url) => {
      window.gtag?.('config', GA_ID, { page_path: url });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <>
      <Head>
        <title>DynaBeat | Nepali Music News & Lyrics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="The pulse of  music. Find lyrics, news, and exclusive stories." />
        <meta property="og:title" content="DynaBeat |  Music  & Lyrics" />
        <meta property="og:description" content="The pulse of  music. Find lyrics, news, and exclusive stories." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pandeykapil.com.np/logo/logo.webp" />
        <link rel="canonical" href={`https://pandeykapil.com.np${router.asPath}`} />
      </Head>

      {!isAdminPage && (
        <>
          <Onscreen />
          <Navbar />
          {/* Only render after mount — BackToTop reads window.scrollY (client only) */}
          {mounted && showBackToTop && <BackToTop />}
        </>
      )}

      <main className={isAdminPage ? 'admin-viewport' : 'site-viewport'}>
        <Component {...pageProps} />
      </main>

      {!isAdminPage && <Footer />}

      <Analytics />
    </>
  );
}

export default MyApp;