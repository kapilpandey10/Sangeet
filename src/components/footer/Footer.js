import React from 'react';
import './style/Footer.css';
import { FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2024 Dynabeat. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacyandpolicy">Privacy Policy</a>
          <a href="/contactus">Contact Us</a>
        </div>
        <div className="social-links">
          <a className="facebook" href="https://www.facebook.com/Burn2VLOG" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a className="youtube" href="https://www.youtube.com/@BornToVlog" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
