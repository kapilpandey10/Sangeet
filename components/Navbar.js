import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import logo from '../public/logo/logo.webp';  // Ensure the logo is in the public folder
import styles from './style/Navbar.module.css'; // Assuming you have a CSS module for styles

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClickOutside = (e) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isClient]);

  if (!isClient) {
    return null; // Don't render until after client-side hydration
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <button
          className={`${styles.mobileMenuIcon} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={styles.logoBrandContainer}>
          <Image src={logo} alt="Logo" className={styles.navbarLogo} />
          <Link href="/" className={styles.brandName}>
            Dyna<span className={styles.highlight}>Beat</span>
          </Link>
        </div>

        <div className={`${styles.navMenu} ${isMobileMenuOpen ? styles.mobileActive : ''}`} ref={mobileMenuRef}>
          <div className={styles.navLinks}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/lyrics" onClick={() => setIsMobileMenuOpen(false)}>Music Lyrics</Link>
            <Link href="/artistbio" onClick={() => setIsMobileMenuOpen(false)}>Artist Bio</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
          </div>
        </div>

        <button className={styles.searchIcon} aria-label="Search">
          <FaSearch />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
