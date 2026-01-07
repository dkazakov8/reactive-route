import { Link } from '../../components/Link';
import styles from '../../style.module.css';

export default function Prevent() {
  return (
    <div className={`${styles.pageContainer} ${styles.preventPage}`}>
      <div className={styles.pageTitle}>Navigation guards</div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>beforeEnter + beforeLeave</div>
        <div className={styles.textBlock}>This page shows both lifecycle guards on one route.</div>
        <div className={styles.textBlock}>
          Entering from <code className={styles.inlineCode}>dynamic</code> redirects to{' '}
          <code className={styles.inlineCode}>static</code>. Leaving to{' '}
          <code className={styles.inlineCode}>query</code> is blocked.
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Rules</div>
        <div className={styles.panelItem}>
          <div className={styles.itemIcon}>⚠️</div>
          <div className={styles.itemBody}>
            <div className={styles.textBlock}>
              <div className={styles.labelStrong}>From dynamic:</div> redirected to static.
            </div>
          </div>
        </div>
        <div className={styles.panelItem}>
          <div className={styles.itemIcon}>🚫</div>
          <div className={styles.itemBody}>
            <div className={styles.textBlock}>
              <div className={styles.labelStrong}>To query:</div> navigation is prevented.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionNav}>
        <div className={styles.sectionTitle}>Try next</div>
        <Link to={{ name: 'static' }} className={styles.navButton}>
          Static
        </Link>
        <Link to={{ name: 'dynamic', params: { foo: 'example' } }} className={styles.navButton}>
          Dynamic
        </Link>
        <Link
          to={{ name: 'query', query: { foo: 'example' } }}
          className={`${styles.navButton} ${styles.navButtonBlocked}`}
        >
          Blocked query
        </Link>
      </div>
    </div>
  );
}
