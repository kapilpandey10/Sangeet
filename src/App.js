import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ViewLyrics from './components/ViewLyrics';
import AddLyrics from './components/AddLyrics';
import LyricsList from './components/LyricsList';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndService from './components/TermsAndService';
import ContactUs from './components/ContactUs';
import SearchResults from './components/SearchResults';
import AdminLogin from './components/AdminLogin';
import BhajanHP from './components/Bhajan/bhajanHP'; // Import the BhajanHP component
import ArtistBio from './components/ArtistBio'; // Import ArtistBio component


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Admin login and dashboard */}
        <Route path="/admin/login" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route 
          path="/admin/*" 
          element={
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" />
            )
          } 
        />
        {/* Catch-all route to redirect to homepage */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/artistbio/:name" element={<ArtistBio />} /> {/* Route for ArtistBio */}
        <Route path="/lyrics/:id" element={<ViewLyrics />} />
        <Route path="/lyrics" element={<LyricsList />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndService />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/add" element={<AddLyrics />} />
        <Route path="/bhajan" component={BhajanHP} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
