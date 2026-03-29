import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../public/logo/logo.webp';
import styles from './style/Navbar.module.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);

  /* ---------------- Scroll effect ---------------- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  /* ---------------- Toggle menu ---------------- */
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen((prev) => !prev);
  };

  /* ---------------- Click outside close ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  /* ---------------- ESC key close ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = useCallback(
    (path) => (router.pathname === path ? styles.active : ''),
    [router.pathname]
  );

  return (
    <nav
      className={`${styles.navContainer} ${isScrolled ? styles.scrolled : ''}`}
      aria-label="Main Navigation"
    >
      {/* Animated accent bar */}
      <div className={styles.accentBar} aria-hidden="true" />

      <div className={styles.navInner}>

        {/* Logo */}
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoWrapper}>
            <Image
              src={logo}
              alt="DynaBeat Logo"
              className={styles.navLogo}
              priority
            />
          </div>
          <span className={styles.brandName}>
            Dyna<span className={styles.brandAccent}>Beat</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          {[
            { href: '/viewlyrics', label: 'Lyrics' },
            { href: '/artistbio', label: 'Artists' },
            { href: '/blogs', label: 'Blog' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive(href)}`}
            >
              <span className={styles.navLinkText}>{label}</span>
              <span className={styles.navLinkUnderline} aria-hidden="true" />
            </Link>
          ))}
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

        {/* Mobile Right Controls */}
        <div className={styles.mobileControls}>
          <button
            className={styles.mobileSearchBtn}
            onClick={() => router.push('/searchresults')}
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <button
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`${styles.hamburgerIcon} ${isMobileMenuOpen ? styles.open : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        ref={menuRef}
        className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className={styles.drawerInner}>
          {[
            { href: '/viewlyrics', label: 'Lyrics' },
            { href: '/artistbio', label: 'Artists' },
            { href: '/blogs', label: 'Blog' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className={`${styles.drawerLink} ${isActive(href)}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={styles.drawerContactBtn}
            style={{ animationDelay: '180ms' }}
          >
            Get in Touch
          </Link>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
