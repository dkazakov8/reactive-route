import styles from '../../style.module.css';

export default function Home() {
  return (
    <div className={`${styles.pageContainer} ${styles.staticPage}`}>
      <div className={styles.pageTitle}>Home redirect</div>

      <div className={`${styles.panel} ${styles.panelLead}`}>
        <div className={styles.itemIcon}>⏱️</div>
        <div className={styles.itemBody}>
          <div className={styles.textBlock}>
            This route redirects to <code className={styles.inlineCode}>static</code> from{' '}
            <code className={styles.inlineCode}>beforeEnter</code>.
          </div>
          <div className={styles.textBlock}>The page exists only to demonstrate redirect flow.</div>
        </div>
      </div>
    </div>
  );
}
