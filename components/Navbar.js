import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaSearch, FaBars, FaTimes, FaBroadcastTower } from 'react-icons/fa';
import logo from '../public/logo/logo.webp';
import styles from './style/Navbar.module.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);

  /* ---------------- Scroll effect ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---------------- Close menu on route change ---------------- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  /* ---------------- Lock body scroll when mobile menu open ---------------- */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
  }, [isMobileMenuOpen]);

  /* ---------------- ESC key close ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ---------------- Click outside close ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  /* ---------------- Active link helper ---------------- */
  const isActive = useCallback(
    (path) => (router.pathname === path ? styles.active : ''),
    [router.pathname]
  );

  return (
    <nav
      className={`${styles.navContainer} ${isScrolled ? styles.scrolled : ''}`}
      aria-label="Main Navigation"
    >
      <div className={styles.navInner} ref={menuRef}>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo */}
        <Link href="/" className={styles.logoLink}>
          <Image
            src={logo}
            alt="DynaBeat Logo"
            className={styles.navLogo}
            priority
          />
          <span className={styles.brandName}>
            Dyna<span className={styles.brandAccent}>Beat</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div
          className={`${styles.navLinks} ${
            isMobileMenuOpen ? styles.mobileActive : ''
          }`}
        >
          <Link href="/viewlyrics" className={isActive('/viewlyrics')}>
            Lyrics
          </Link>

          <Link href="/artistbio" className={isActive('/artistbio')}>
            Artists
          </Link>

          <Link href="/blogs" className={isActive('/blogs')}>
            Blog
          </Link>

          <Link href="/radio" className={styles.specialLink}>
            <FaBroadcastTower />
            <span>Live Radio</span>
          </Link>

          {/* Mobile only */}
          <Link href="/contact" className={styles.mobileOnlyLink}>
            Get in Touch
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          <button
            className={styles.searchBtn}
            onClick={() => router.push('/searchresults')}
            aria-label="Search"
          >
            <FaSearch />
          </button>

          <Link href="/contact" className={styles.contactBtn}>
            Get in Touch
          </Link>
        </div>

        {/* Mobile Search */}
        <button
          className={styles.mobileSearchBtn}
          onClick={() => router.push('/searchresults')}
          aria-label="Search"
        >
          <FaSearch />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
