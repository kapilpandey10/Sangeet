import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LyricsList from './components/LyricsList';
import ContactUs from './components/ContactUs';

import HomePage from './components/HomePage';
import ViewLyrics from './components/ViewLyrics';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndService from './components/TermsAndService';
import SearchResults from './components/SearchResults';
import AdminLogin from './components/AdminLogin';
import BhajanHP from './components/Bhajan/bhajanHP'; 
import ArtistBio from './components/ArtistBio';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
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
        
        {/* Catch-all route to redirect to homepage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
