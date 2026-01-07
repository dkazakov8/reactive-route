import { Link } from '../../components/Link';
import styles from '../../style.module.css';

export default function Error(props: { errorCode: number }) {
  return (
    <div className={`${styles.pageContainer} ${styles.errorPage}`}>
      <div className={styles.errorContainer}>
        <div className={styles.errorCode}>{props.errorCode}</div>
        <div className={styles.pageTitle}>
          {props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error'}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>
          {props.errorCode === 404 ? 'Fallback route' : 'Runtime fallback'}
        </div>
        <div className={styles.textBlock}>
          {props.errorCode === 404
            ? 'Shown when no route matches the requested URL.'
            : 'Shown when route processing or rendering throws unexpectedly.'}
        </div>
        {props.errorCode === 404 ? (
          <div className={styles.textBlock}>
            The URL stays useful for debugging while the app renders a controlled fallback.
          </div>
        ) : (
          <div className={styles.textBlock}>
            The router switches to a safe screen instead of leaving the app in a broken state.
          </div>
        )}
      </div>

      <div className={styles.sectionNav}>
        <div className={styles.sectionTitle}>Try next</div>
        <Link to={{ name: 'static' }} className={styles.navButton}>
          Static
        </Link>
        <Link to={{ name: 'dynamic', params: { foo: 'example' } }} className={styles.navButton}>
          Dynamic
        </Link>
        <Link to={{ name: 'query', query: { foo: 'example' } }} className={styles.navButton}>
          Query
        </Link>
        <Link to={{ name: 'preventRedirect' }} className={styles.navButton}>
          Guards
        </Link>
      </div>
    </div>
  );
}
