import React, { useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'; 
import { Helmet } from 'react-helmet'; 
import Navbar from './components/Navbar';
import Footer from './components/footer/Footer';
import LyricsList from './components/LyricsList';
import ContactUs from './components/ContactUs';
import HomePage from './components/HomePage';
import ViewLyrics from './components/ViewLyrics';
import AdminDashboard from './components/Admin/AdminDashboard';
import PrivacyPolicy from './components/footer/PrivacyPolicy';
import TermsAndService from './components/footer/TermsAndService';
import SearchResults from './components/SearchResults';
import AdminLogin from './components/Admin/AdminLogin';
import BhajanHP from './components/Bhajan/bhajanHP';
import ArtistBio from './components/Artist/ArtistBio';
import RequestResetCode from './components/ RequestResetCode';
import ResetPassword from './components/ResetPassword';
import Artistlist from './components/Artist/Artistlist';
import BackToTop from './components/BackToTop'; // Make sure the path is correct

import FtAnthem from './components/FtAnthem'; // Import the component


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation(); 

  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/1234/secret';

  return (
    <>
      {/* SEO using Helmet */}
      <Helmet>
        <title>Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists</title>
        <meta
          name="description"
          content="Explore Nepali music, songs, lyrics, and albums. Featured artists like Sushant KC, 1974 AD, Anju Panta, Narayan Gopal, Melina Rai, and more. Discover Nepali geet and bhajan lyrics."
        />
        <meta
          name="keywords"
          content="Nepali music, Nepali songs, Nepali lyrics, Nepali artists, music library, Sangit, Sushant KC lyrics, 1974 AD lyrics, Anju Panta lyrics, Narayan Gopal lyrics, Melina Rai lyrics, Raju Lama lyrics, Pramod Kharel lyrics, Sadhana Sargam Nepali songs lyrics, Udit Narayan Nepali lyrics, Krishna Kafle lyrics, Nepali song lyrics, Nepali music lyrics, Nepali geet lyrics"
        />
        <meta property="og:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta
          property="og:description"
          content="Explore a vast collection of Nepali songs and lyrics, including works by Sushant KC, Anju Panta, Narayan Gopal, Melina Rai, and more."
        />
        <meta property="og:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta
          name="twitter:description"
          content="Explore Nepali music, songs, lyrics, and albums from popular artists."
        />
        <meta name="twitter:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />

        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Sangeet Lyrics Central',
            description: 'A Nepali Music Digital Library to explore lyrics, songs, and albums.',
            url: 'https://pandeykapil.com.np',
            telephone: '+977-9840172406',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+977-9840172406',
              contactType: 'Customer Service',
              availableLanguage: ['English', 'Nepali'],
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Kathmandu, Nepal',
              addressLocality: 'Kathmandu',
              addressRegion: 'Bagmati',
              postalCode: '44900',
              addressCountry: 'NP',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '27.72',
              longitude: '85.31',
            },
            sameAs: ['https://facebook.com/Burn2Vlog', 'https://youtube.com/c/borntovlog'],
          })}
        </script>

        {/* BreadcrumbList structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pandeykapil.com.np/' },
              { '@type': 'ListItem', position: 2, name: 'Artist Bio', item: 'https://pandeykapil.com.np/artistbio' },
              { '@type': 'ListItem', position: 3, name: 'Lyrics List', item: 'https://pandeykapil.com.np/lyrics-list' },
              { '@type': 'ListItem', position: 4, name: 'Contact Us', item: 'https://pandeykapil.com.np/contactus' },
            ],
          })}
        </script>
      </Helmet>

      <Navbar />
      <BackToTop />
      <Routes>
       
        {/* Admin login and dashboard */}
        <Route path="/1234/secret" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/admin/*"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/1234/secret" replace />} // Admin protected routes
        />

        {/* Public routes */}
        <Route path="/request-reset-code" element={<RequestResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/artistbio/:name" element={<ArtistBio />} />
        <Route path="/lyrics/:title" element={<ViewLyrics />} />
        <Route path="/lyrics-list" element={<LyricsList />} />
        <Route path="/privacyandpolicy" element={<PrivacyPolicy />} />
        <Route path="/anthem/:country" element={<FtAnthem />} />
        <Route path="/terms" element={<TermsAndService />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/bhajan" element={<BhajanHP />} />
        <Route path="/Artistbio" element={<Artistlist />} />
        {/* Multilanguage lyrics routes */}
        <Route path="/lyrics/en/:title" element={<ViewLyrics language="en" />} />
        <Route path="/lyrics/ne/:title" element={<ViewLyrics language="ne" />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    
      <Footer />
    </>
  );
}

export default App;
