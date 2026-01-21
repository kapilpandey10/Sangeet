import Link from 'next/link';
import styles from './style/Footer.module.css';
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Brand & SEO Description Section */}
        <div className={styles.brandSection}>
          <Link href="/" className={styles.footerLogo}>
            Dyna<span>Beat</span>
          </Link>
          <p className={styles.brandDesc}>
            DynaBeat is Nepal's premier digital library for accurate music lyrics, 
            detailed artist biographies, and high-quality live radio streaming. 
            Join our community and explore the pulse of Nepali music.
          </p>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/Burn2VLOG" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.youtube.com/@BornToVlog" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        {/* Categorized Quick Links */}
        <div className={styles.linksGrid}>
          <div className={styles.linkColumn}>
            <h4>Explore</h4>
            <Link href="/viewlyrics">Music Lyrics</Link>
            <Link href="/artistbio">Artist Bios</Link>
            <Link href="/radio">Live Radio</Link>
            <Link href="/blogs">Latest Blogs</Link>
          </div>
          <div className={styles.linkColumn}>
            <h4>Support</h4>
            <Link href="/contact">Contact Us</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacyandpolicy">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className={styles.copyrightBar}>
        <p>&copy; {new Date().getFullYear()} <strong>DynaBeat</strong>. Created for the Love of Music.</p>
      </div>
    </footer>
  );
};

export default Footer;