import { Link } from '../../components/Link';
import styles from '../../style.module.css';

export default function Static() {
  return (
    <div className={`${styles.pageContainer} ${styles.staticPage}`}>
      <div className={styles.pageTitle}>Static Page</div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Fixed path</div>
        <div className={styles.textBlock}>
          A plain route with a fixed URL. Open <code className={styles.inlineCode}>/static</code>{' '}
          and the loader renders this page.
        </div>
        <div className={styles.textBlock}>
          The home page uses <code className={styles.inlineCode}>beforeEnter</code> and lands here
          automatically.
        </div>
      </div>

      <div className={styles.sectionNav}>
        <div className={styles.sectionTitle}>Try next</div>
        <Link className={styles.navButton} to={{ name: 'dynamic', params: { foo: 'example' } }}>
          Dynamic
        </Link>
        <Link className={styles.navButton} to={{ name: 'query', query: { foo: 'example' } }}>
          Query
        </Link>
        <Link className={styles.navButton} to={{ name: 'preventRedirect' }}>
          Guards
        </Link>
      </div>
    </div>
  );
}
