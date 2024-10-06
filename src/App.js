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
import FileTransfer from './components/FileTransfer';
import SendImage from './components/SendImage'; // Import the SendImage page
import ReceiveImage from './components/ReceiveImage'; // Import the ReceiveImage page
import CreateCard from './components/CreateCard'; 
import ViewCard from './components/ViewCard'; // Correct name here
import Greeting  from './components/Greetings';





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
     

      <Navbar />
      <BackToTop />
      <div className="main-content">
        <Routes>
          {/* Admin login and dashboard */}
          <Route path="/1234/secret" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/admin/*" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/1234/secret" replace />} />

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
          <Route path="/searchresult" element={<SearchResults />} /> {/* Search Results Route */}
          <Route path="/filetransfer" element={<FileTransfer />} />
          <Route path="/sendimage" element={<SendImage />} /> {/* Route to SendImage */}
          <Route path="/receiveimg" element={<ReceiveImage />} /> {/* Route to ReceiveImage */}
        
          {/* Add Blog functionality */}
          <Route path="/addblog" element={<AddBlog />} />

          {/* Blog Homepage to display all blogs */}
          <Route path="/Blogs" element={<BlogHomepage />} />
          <Route path="/greetings" element={<Greeting />} />
          <Route path="/create-card" element={<CreateCard />} />
          <Route path="/cards/:recipient" element={<ViewCard />} />


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
