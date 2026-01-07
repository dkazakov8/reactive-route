import { Link } from '../../components/Link';
import { useRouter } from '../../router';
import styles from '../../style.module.css';

export default function Dynamic() {
  const { router } = useRouter();

  const pageState = router.state.dynamic!;

  return (
    <div className={`${styles.pageContainer} ${styles.dynamicPage}`}>
      <div className={styles.pageTitle}>Dynamic Page</div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Current params</div>
        <pre className={styles.codeBlock}>
          <code className={styles.inlineCode}>{JSON.stringify(pageState.params, null, 2)}</code>
        </pre>
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Path param</div>
        <div className={styles.textBlock}>
          The segment <code className={styles.inlineCode}>:foo</code> is read from the URL and
          validated before the page loads.
        </div>
        <div className={styles.textBlock}>
          Values shorter than 3 characters are rejected, so invalid URLs never reach this screen.
        </div>
        <div className={styles.actionSpacer} />
        <div
          className={styles.navButton}
          onClick={() => {
            void router.redirect({
              name: 'dynamic',
              params: { foo: String(Math.random()).slice(2, 10) },
            });
          }}
        >
          Random value
        </div>
        <div className={styles.note}>Generates a valid param and redirects to it.</div>
      </div>

      <div className={styles.sectionNav}>
        <div className={styles.sectionTitle}>Try next</div>
        <Link to={{ name: 'static' }} className={styles.navButton}>
          Static
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
