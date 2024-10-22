import Link from 'next/link';
import styles from '../styles/404.module.css'; // Import CSS Module

const Custom404 = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.emojiWrapper}>
          <svg className={styles.sadEmoji} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            {/* Face */}
            <circle cx="32" cy="32" r="30" fill="#f8d733" />
            
            {/* Eyes */}
            <circle cx="22" cy="24" r="4" className={styles.eye} />
            <circle cx="42" cy="24" r="4" className={styles.eye} />

            {/* Mouth */}
            <path d="M22,44 C28,38 36,38 42,44" stroke="#333" strokeWidth="2" strokeLinecap="round" />

            {/* Tear Drop - adjusted position closer to the right eye */}
            <path
              d="M42,28 Q44,38 38,40 Q34,38 36,28 Z"
              fill="#00c5ff"
              className={styles.tear}
            />
          </svg>
        </div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>Please use the Search button to search. There is always a chance you might Discover it. </p>
        <Link href="/">
          <span className={styles.homeLink}>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
