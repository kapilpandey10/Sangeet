import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Import Helmet for SEO
import Navbar from './components/Navbar';
import Footer from './components/footer/Footer';

// Remove these as you're using lazy loading
// import LyricsList from './components/LyricsList';
// import ContactUs from './components/ContactUs';
// import HomePage from './components/HomePage';
// import ViewLyrics from './components/ViewLyrics';
// import AdminDashboard from './components/Admin/AdminDashboard';
// import PrivacyPolicy from './components/footer/PrivacyPolicy';
// import TermsAndService from './components/footer/TermsAndService';
// import SearchResults from './components/SearchResults';
// import AdminLogin from './components/Admin/AdminLogin';
// import BhajanHP from './components/Bhajan/bhajanHP';
// import ArtistBio from './components/Artist/ArtistBio';
// import ForgotPassword from './components/ForgotPassword';
// import ResetPassword from './components/ResetPassword';
// import Artistlist from './components/Artist/Artistlist';

// Use lazy loading for components
const LyricsList = React.lazy(() => import('./components/LyricsList'));
const ContactUs = React.lazy(() => import('./components/ContactUs'));
const HomePage = React.lazy(() => import('./components/HomePage'));
const ViewLyrics = React.lazy(() => import('./components/ViewLyrics'));
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard'));
const PrivacyPolicy = React.lazy(() => import('./components/footer/PrivacyPolicy'));
const TermsAndService = React.lazy(() => import('./components/footer/TermsAndService'));
const SearchResults = React.lazy(() => import('./components/SearchResults'));
const AdminLogin = React.lazy(() => import('./components/Admin/AdminLogin'));
const BhajanHP = React.lazy(() => import('./components/Bhajan/bhajanHP'));
const ArtistBio = React.lazy(() => import('./components/Artist/ArtistBio'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/ResetPassword'));
const Artistlist = React.lazy(() => import('./components/Artist/Artistlist'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Google Translate widget initialization
  useEffect(() => {
    const addTranslateScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'ne' }, 
        'google_translate_element'
      );
    };

    addTranslateScript();
  }, []);

  return (
    <>
      {/* General SEO for the entire app using Helmet */}
      <Helmet>
        <title>Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists</title>
        <meta name="description" content="Explore Nepali music, songs, lyrics, and albums. Featured artists like Sushant KC, 1974 AD, Anju Panta, Narayan Gopal, Melina Rai, and more. Discover Nepali geet and bhajan lyrics." />
        <meta name="keywords" content="Nepali music, Nepali songs, Nepali lyrics, Nepali artists, music library, Sangit, Sushant KC lyrics, 1974 AD lyrics, Anju Panta lyrics, Narayan Gopal lyrics, Melina Rai lyrics, Raju Lama lyrics, Pramod Kharel lyrics, Sadhana Sargam Nepali songs lyrics, Udit Narayan Nepali lyrics, Krishna Kafle lyrics, Nepali song lyrics, Nepali music lyrics, Nepali geet lyrics" />
        <meta property="og:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta property="og:description" content="Explore a vast collection of Nepali songs and lyrics, including works by Sushant KC, Anju Panta, Narayan Gopal, Melina Rai, and more." />
        <meta property="og:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta name="twitter:description" content="Explore Nepali music, songs, lyrics, and albums from popular artists." />
        <meta name="twitter:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />

        {/* LocalBusiness structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Sangeet Lyrics Central",
            "description": "A Nepali Music Digital Library to explore lyrics, songs, and albums.",
            "url": "https://pandeykapil.com.np",
            "telephone": "+977-9840172406",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+977-9840172406",
              "contactType": "Customer Service",
              "availableLanguage": ["English", "Nepali"]
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kathmandu, Nepal",
              "addressLocality": "Kathmandu",
              "addressRegion": "Bagmati",
              "postalCode": "44900",
              "addressCountry": "NP"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "27.72",
              "longitude": "85.31"
            },
            "sameAs": [
              "https://facebook.com/Burn2Vlog",
              "https://youtube.com/c/borntovlog"
            ]
          })}
        </script>

        {/* BreadcrumbList structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://pandeykapil.com.np/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Artist Bio",
                "item": "https://pandeykapil.com.np/artistbio"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Lyrics List",
                "item": "https://pandeykapil.com.np/lyrics-list"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Contact Us",
                "item": "https://pandeykapil.com.np/contactus"
              }
            ]
          })}
        </script>
      </Helmet>

      <Router>
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Admin login and dashboard */}
            <Route path="/admin-login" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
            <Route 
              path="/admin/*" 
              element={
                isAuthenticated ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/admin-login" />  // Redirect to the login page if not authenticated
                )
              } 
            />
            
            {/* Public routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/artistbio/:name" element={<ArtistBio />} />
            <Route path="/lyrics/:title" element={<ViewLyrics />} />
            <Route path="/lyrics-list" element={<LyricsList />} />
            <Route path="/privacyandpolicy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndService />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/bhajan" element={<BhajanHP />} />
            <Route path="/Artistbio" element={<Artistlist />} />

            {/* Multilanguage */}
            <Route path="/lyrics/en/:title" element={<ViewLyrics language="en" />} />
            <Route path="/lyrics/ne/:title" element={<ViewLyrics language="ne" />} />

            {/* Catch-all route to redirect to homepage */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </>
  );
}

export default App;
