import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Import Helmet for SEO
import Navbar from './components/Navbar';
import Footer from './components/footer/Footer';
import LyricsList from './components/LyricsList';
import ContactUs from './components/ContactUs';
import { Analytics } from "@vercel/analytics/react";
import HomePage from './components/HomePage';
import ViewLyrics from './components/ViewLyrics';
import AdminDashboard from './components/Admin/AdminDashboard';
import PrivacyPolicy from './components/footer/PrivacyPolicy';
import TermsAndService from './components/footer/TermsAndService';
import SearchResults from './components/SearchResults';
import AdminLogin from './components/Admin/AdminLogin';
import BhajanHP from './components/Bhajan/bhajanHP';
import ArtistBio from './components/Artist/ArtistBio';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Artistlist from './components/Artist/Artistlist';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {/* General SEO for the entire app using Helmet */}
      <Helmet>
        <title>Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists</title>
        <meta name="description" content="Explore Nepali music, songs, lyrics, and albums. Featured artists like Sushant KC, 1974 AD, Anju Panta, Narayan Gopal, Melina Rai, and more. Discover Nepali geet and bhajan lyrics." />
        <meta name="keywords" content="Nepali music, Nepali songs, Nepali lyrics, Nepali artists, music library, Sangit, Sushant KC lyrics, 1974 AD lyrics, Anju Panta lyrics, Narayan Gopal lyrics, Melina Rai lyrics, Raju Lama lyrics, Pramod Kharel lyrics, Sadhana Sargam Nepali songs lyrics, Udit Narayan Nepali lyrics, Krishna Kafle lyrics, Nepali song lyrics, Nepali music lyrics, Nepali geet lyrics, Latest Nepali songs, Nepali lyrics collection, Nepali song lyrics by artist, Nepali bhajan lyrics, Nepali pop song lyrics, Nepali movie song lyrics, Old Nepali song lyrics, Lok geet lyrics, Nepali dohori lyrics, Classical Nepali song lyrics, Adhunik Nepali song lyrics, Folk song lyrics Nepal, Nepali geet lyrics" />
        <meta property="og:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta property="og:description" content="Explore a vast collection of Nepali songs and lyrics, including works by Sushant KC, Anju Panta, Narayan Gopal, Melina Rai, and more." />
        <meta property="og:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />
        <meta property="og:url" content="https://pandeykapil.com.np/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nepali Geet Sangit Lyrics | Explore Nepali Songs, Lyrics & Artists" />
        <meta name="twitter:description" content="Explore Nepali music, songs, lyrics, and albums from popular artists." />
        <meta name="twitter:image" content="https://pandeykapil.com.np/static/media/logo.8eba7158a30d9326a117.webp" />
      </Helmet>

      <Router>
        <Navbar />

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
          {/* Add route for forgot password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Add route for resetting the password */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/artistbio/:name" element={<ArtistBio />} />
          <Route path="/lyrics/:id" element={<ViewLyrics />} />
          <Route path="/lyrics-list" element={<LyricsList />} />
          <Route path="/privacyandpolicy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndService />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/bhajan" element={<BhajanHP />} />
          <Route path="/Artistbio" element={<Artistlist />} />
          
          {/* Catch-all route to redirect to homepage */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Footer />
      </Router>
    </>
  );
}

export default App;
