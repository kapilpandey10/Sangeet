import Link from 'next/link';
import styles from './style/Footer.module.css';
import { FaFacebook, FaYoutube } from 'react-icons/fa'; // Import social icons

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Social Media Links */}
      <div className={styles.socialSection}>
        <a href="https://www.facebook.com/Burn2VLOG" target="_blank" rel="noopener noreferrer">
          <FaFacebook className={styles.socialIcon} />
        </a>
        <a href="https://www.youtube.com/@BornToVlog" target="_blank" rel="noopener noreferrer">
          <FaYoutube className={styles.socialIcon} />
        </a>
      </div>

      {/* Links Section */}
      <div className={styles.linksSection}>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacyandpolicy">Privacy Policy</Link>
        <Link href="/contact">Contact Us</Link>
      </div>

      {/* Branding Section */}
      <div className={styles.brandingSection}>
        <p>&copy; 2024 <span className={styles.brandName}>Dynabeat</span>. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
