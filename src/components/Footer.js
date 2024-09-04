import React from 'react';
import '../style/Footer.css';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2024 Lyrics Central. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div className="social-links">
          <a  class="facebook" href="https://www.facebook.com/Burn2VLOG" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          
          <a href="https://www.youtube.com/@BornToVlog" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
