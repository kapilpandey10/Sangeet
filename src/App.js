import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import AddBlog from './components/Admin/addBlog';
import BlogHomepage from './components/BlogHomepage';
import ReadBlog from './components/ReadBlog';
import ArtistBio from './components/Artist/ArtistBio';
import RequestResetCode from './components/RequestResetCode';
import ResetPassword from './components/ResetPassword';
import Artistlist from './components/Artist/Artistlist';
import BackToTop from './components/BackToTop';
import FileTransfer from './components/FileTransfer';
import SendImage from './components/SendImage';
import ReceiveImage from './components/ReceiveImage';
import CreateCard from './components/CreateCard';
import ViewCard from './components/ViewCard';
import Greeting from './components/Greetings';
import useDetectDevTools from './components/useDetectDevTools';
import useDisableShortcuts from './components/useDisableShortcuts';
import WarningModal from './components/WarningModal';

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const location = useLocation();
  
  // DevTools detection (apply only on desktop)
  const isDevToolsOpen = useDetectDevTools();
  
  // Hook for blocking shortcuts and right-click (apply only on desktop)
  const [showWarning, setShowWarning] = useDisableShortcuts();

  // Track page views on route changes
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_TRACKING_ID, { page_path: location.pathname });
    }
  }, [location]);

  // Persist authentication state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Show Warning Modal if DevTools are open or if right-click/shortcuts are used */}
      {(isDevToolsOpen || showWarning) && <WarningModal />}

      {/* Render the main content of the site */}
      <Navbar />
      <BackToTop />
      <div className="main-content">
        <Routes>
          {/* Admin login and dashboard */}
          <Route 
            path="/1234/secret" 
            element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/admin/*" 
            element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/1234/secret" replace />} 
          />

          {/* Public routes */}
          <Route path="/request-reset-code" element={<RequestResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/artistbio/:name" element={<ArtistBio />} />
          <Route path="/lyrics/:slug" element={<ViewLyrics />} /> 
          <Route path="/lyrics-list" element={<LyricsList />} />
          <Route path="/privacyandpolicy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndService />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/Blogs/:slug" element={<ReadBlog />} />
          <Route path="/searchresult" element={<SearchResults />} />
          <Route path="/filetransfer" element={<FileTransfer />} />
          <Route path="/sendimage" element={<SendImage />} />
          <Route path="/receiveimg" element={<ReceiveImage />} />

          {/* Add Blog functionality */}
          <Route path="/addblog" element={<AddBlog />} />

          {/* Blog Homepage to display all blogs */}
          <Route path="/Blogs" element={<BlogHomepage />} />
          <Route path="/greetings" element={<Greeting />} />
          <Route path="/create-card" element={<CreateCard />} />
          <Route path="/cards/:recipient" element={<ViewCard />} />

          {/* Artist list route */}
          <Route path="/artistbio" element={<Artistlist />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
