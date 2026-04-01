import Link from 'next/link';
import styles from '../styles/404.module.css';

const Custom404 = () => {
  return (
    <div className={styles.container}>
      {/* Ambient background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.content}>
        {/* Glitchy 404 */}
        <div className={styles.codeWrapper}>
          <span className={styles.codeText} data-text="404">404</span>
        </div>

        {/* Divider line */}
        <div className={styles.divider} />

        <p className={styles.label}>PAGE NOT FOUND</p>

        <h1 className={styles.title}>Looks like you've drifted into the void.</h1>

        <p className={styles.message}>
          The page you're looking for doesn't exist, was moved, or never existed at all.
          Try searching, or head back home.
        </p>

        <div className={styles.actions}>
          <Link href="/">
            <span className={styles.primaryBtn}>Return Home</span>
          </Link>
          <Link href="/searchresults">
            <span className={styles.secondaryBtn}>Search Site</span>
          </Link>
        </div>

        {/* Decorative grid coordinates */}
        <p className={styles.coords}>ERR · 404 · NULL · VOID</p>
      </div>
    </div>
  );
};

export default Custom404;