import { Link } from '../../components/Link';
import styles from '../../style.module.css';

export default function Static() {
  return (
    <div class={`${styles.pageContainer} ${styles.staticPage}`}>
      <div class={styles.pageTitle}>Static Page</div>

      <div class={styles.panel}>
        <div class={styles.sectionTitle}>Fixed path</div>
        <div class={styles.textBlock}>
          A plain route with a fixed URL. Open <code class={styles.inlineCode}>/static</code> and
          the loader renders this page.
        </div>
        <div class={styles.textBlock}>
          The home page uses <code class={styles.inlineCode}>beforeEnter</code> and lands here
          automatically.
        </div>
      </div>

      <div class={styles.sectionNav}>
        <div class={styles.sectionTitle}>Try next</div>
        <Link class={styles.navButton} to={{ name: 'dynamic', params: { foo: 'example' } }}>
          Dynamic
        </Link>
        <Link class={styles.navButton} to={{ name: 'query', query: { foo: 'example' } }}>
          Query
        </Link>
        <Link class={styles.navButton} to={{ name: 'guards' }}>
          Guards
        </Link>
      </div>
    </div>
  );
}
