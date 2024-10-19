import Link from 'next/link'; // Use Next.js Link component
import styles from './style/Footer.module.css';
import { FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.logo}>
          <p>&copy; 2024 Dynabeat. All rights reserved.</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacyandpolicy">Privacy Policy</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
        <div className={styles.socialLinks}>
          <a className={styles.facebook} href="https://www.facebook.com/Burn2VLOG" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a className={styles.youtube} href="https://www.youtube.com/@BornToVlog" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
