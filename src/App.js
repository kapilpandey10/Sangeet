import React, { useEffect, useState } from 'react';
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
import AddBlog from './components/Admin/addBlog'; // AddBlog component for adding blog functionality
import BlogHomepage from './components/BlogHomepage'; // Import the BlogHomepage component
import ReadBlog from './components/ReadBlog';
import ArtistBio from './components/Artist/ArtistBio';
import RequestResetCode from './components/RequestResetCode';
import ResetPassword from './components/ResetPassword';
import Artistlist from './components/Artist/Artistlist';
import BackToTop from './components/BackToTop';

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const location = useLocation();

  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/admin-login';

  // Track page views on route changes
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_TRACKING_ID, { page_path: location.pathname });
    }
  }, [location]);

  // Ensure authentication state is saved
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* SEO using Helmet */}
      <Helmet>
        <title>Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists</title>
        <meta name="description" content="Explore Nepali music, songs, lyrics, and albums. Featured artists like Sushant KC, 1974 AD, Anju Panta, Narayan Gopal, Melina Rai, and more. Discover Nepali geet and bhajan lyrics." />
        <meta property="og:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta property="og:description" content="Explore a vast collection of Nepali songs and lyrics, including works by Sushant KC, Anju Panta, Narayan Gopal, Melina Rai, and more." />
        <meta property="og:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Navbar />
      <BackToTop />
      <Routes>
        {/* Admin login and dashboard */}
        <Route path="/1234/secret" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/admin/*" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/1234/secret" replace />} />

        {/* Public routes */}
        <Route path="/request-reset-code" element={<RequestResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/artistbio/:name" element={<ArtistBio />} />
        <Route path="/lyrics/:title" element={<ViewLyrics />} />
        <Route path="/lyrics-list" element={<LyricsList />} />
        <Route path="/privacyandpolicy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndService />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/ReadBlog/:slug" element={<ReadBlog />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Add Blog functionality */}
        <Route path="/addblog" element={<AddBlog />} />

        {/* Blog Homepage to display all blogs */}
        <Route path="/blogs" element={<BlogHomepage />} />

        <Route path="/artistbio" element={<Artistlist />} />

       
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
