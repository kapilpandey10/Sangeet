import Link from 'next/link';
import styles from './style/Footer.module.css';
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>

      {/* ── Decorative top border ───────────────────────────────────────── */}
      <div className={styles.topBorder} aria-hidden />

      <div className={styles.footerContainer}>

        {/* ── Brand Section ──────────────────────────────────────────────── */}
        <div className={styles.brandSection}>
          <Link href="/" className={styles.footerLogo}>
            Dyna<span>Beat</span>
          </Link>
          <p className={styles.brandTagline}>COLOR · MUSIC · WORLD</p>
          <p className={styles.brandDesc}>
            DynaBeat is a global digital library for accurate music lyrics and
            in-depth artist biographies — spanning every genre, every language,
            every corner of the world. Discover the music that moves you.
          </p>
          <div className={styles.socialIcons}>
            <a
              href="https://www.facebook.com/Burn2VLOG"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={styles.socialLink}
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.youtube.com/@BornToVlog"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className={styles.socialLink}
            >
              <FaYoutube />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialLink}>
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* ── Link Columns ───────────────────────────────────────────────── */}
        <div className={styles.linksGrid}>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Explore</h4>
            <Link href="/viewlyrics" className={styles.footerLink}>Music Lyrics</Link>
            <Link href="/artistbio"  className={styles.footerLink}>Artist Bios</Link>
            <Link href="/blogs"      className={styles.footerLink}>Latest Blogs</Link>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Contribute</h4>
            {/* ── Submit Lyrics — opens pages/Admin/addlyrics.js ── */}
            <Link href="/submitlyrics" className={`${styles.footerLink} ${styles.submitLink}`}>
              <span className={styles.submitDot} aria-hidden />
              Submit Lyrics
            </Link>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Legal</h4>
            <Link href="/terms"            className={styles.footerLink}>Terms of Service</Link>
            <Link href="/privacyandpolicy" className={styles.footerLink}>Privacy Policy</Link>
          </div>

        </div>
      </div>

      {/* ── Copyright Bar ──────────────────────────────────────────────────── */}
      <div className={styles.copyrightBar}>
        <div className={styles.copyrightInner}>
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <strong className={styles.copyrightBrand}>DynaBeat</strong>.
            Created for the Love of Music — Worldwide.
          </p>
          <span className={styles.copyrightDivider} aria-hidden>·</span>
          <p className={styles.copyrightSub}>All lyrics are property of their respective owners.</p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;