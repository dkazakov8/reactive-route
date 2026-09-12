import { Link } from '../../components/Link';
import { useRouter } from '../../router';
import styles from '../../style.module.css';

export default function Query() {
  const { router } = useRouter();

  const pageState = router.state.query!;

  return (
    <div class={`${styles.pageContainer} ${styles.queryPage}`}>
      <div class={styles.pageTitle}>Query Page</div>

      <div class={styles.panel}>
        <div class={styles.sectionTitle}>Current query</div>
        <pre class={styles.codeBlock}>
          <code class={styles.inlineCode}>{JSON.stringify(pageState.query, null, 2)}</code>
        </pre>
      </div>

      <div class={styles.panel}>
        <div class={styles.sectionTitle}>Optional state</div>
        <div class={styles.textBlock}>
          Query values do not change the route match, but they can still be validated.
        </div>
        <div class={styles.textBlock}>
          Here <code class={styles.inlineCode}>foo</code> is optional, and only valid values appear
          in router state.
        </div>
        <div class={styles.actionSpacer} />
        <div
          class={styles.navButton}
          onClick={() => {
            void router.redirect({
              name: 'query',
              query: { foo: String(Math.random()).slice(2, 10) },
            });
          }}
        >
          Random query
        </div>
        <div class={styles.note}>Generates a valid query and redirects to it.</div>
      </div>

      <div class={styles.sectionNav}>
        <div class={styles.sectionTitle}>Try next</div>
        <Link to={{ name: 'static' }} class={styles.navButton}>
          Static
        </Link>
        <Link to={{ name: 'dynamic', params: { foo: 'example' } }} class={styles.navButton}>
          Dynamic
        </Link>
        <Link to={{ name: 'guards' }} class={styles.navButton}>
          Guards
        </Link>
      </div>
    </div>
  );
}
