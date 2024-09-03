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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lyrics/:id" element={<ViewLyrics />} />
        <Route path="/lyrics" element={<LyricsList />} />
        <Route path="/add" element={<AddLyrics />} />
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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndService />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all route */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
