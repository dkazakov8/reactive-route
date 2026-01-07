import { Link } from '../../components/Link';
import { useRouter } from '../../router';
import styles from '../../style.module.css';

export default function Query() {
  const { router } = useRouter();

  const pageState = router.state.query!;

  return (
    <div className={`${styles.pageContainer} ${styles.queryPage}`}>
      <div className={styles.pageTitle}>Query Page</div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Current query</div>
        <pre className={styles.codeBlock}>
          <code className={styles.inlineCode}>{JSON.stringify(pageState.query, null, 2)}</code>
        </pre>
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Optional state</div>
        <div className={styles.textBlock}>
          Query values do not change the route match, but they can still be validated.
        </div>
        <div className={styles.textBlock}>
          Here <code className={styles.inlineCode}>foo</code> is optional, and only valid values
          appear in router state.
        </div>
        <div className={styles.actionSpacer} />
        <div
          className={styles.navButton}
          onClick={() => {
            void router.redirect({
              name: 'query',
              query: { foo: String(Math.random()).slice(2, 10) },
            });
          }}
        >
          Random query
        </div>
        <div className={styles.note}>Generates a valid query and redirects to it.</div>
      </div>

      <div className={styles.sectionNav}>
        <div className={styles.sectionTitle}>Try next</div>
        <Link to={{ name: 'static' }} className={styles.navButton}>
          Static
        </Link>
        <Link to={{ name: 'dynamic', params: { foo: 'example' } }} className={styles.navButton}>
          Dynamic
        </Link>
        <Link to={{ name: 'preventRedirect' }} className={styles.navButton}>
          Guards
        </Link>
      </div>
    </div>
  );
}
