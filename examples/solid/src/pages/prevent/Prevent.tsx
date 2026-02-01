import { Link } from '../../components/Link';

export default function Prevent() {
  return (
    <div class="pageContainer preventPage">
      <h1>Prevent Redirect Page</h1>

      <div class="routeInfo">
        <h2>Route Configuration</h2>
        <pre>
          {`preventRedirect: {
  path: '/prevent',
  async beforeEnter({ currentState, redirect }) {
    if (currentState?.name === 'dynamic') {
      return redirect({ name: 'static' });
    }
  },
  async beforeLeave({ nextState, preventRedirect }) {
    if (nextState.name === 'query') {
      return preventRedirect();
    }
  },
  loader: () => import('./pages/prevent'),
}`}
        </pre>
      </div>

      <div class="routeDescription">
        <h2>How it works</h2>
        <p>
          This page demonstrates navigation guards using <code>beforeEnter</code> and{' '}
          <code>beforeLeave</code> hooks.
        </p>
        <h3>beforeEnter Hook</h3>
        <p>
          The <code>beforeEnter</code> hook is called before navigating to this page. In this
          example, if you're coming from the Dynamic page, you'll be redirected to the Static page
          instead.
        </p>
        <h3>beforeLeave Hook</h3>
        <p>
          The <code>beforeLeave</code> hook is called before navigating away from this page. In this
          example, if you try to navigate to the Query page, the navigation will be prevented.
        </p>
      </div>

      <div class="navigationRules">
        <h2>Navigation Rules</h2>
        <div class="rule">
          <div class="ruleIcon">⚠️</div>
          <div class="ruleText">
            <strong>Coming from Dynamic page:</strong> You will be redirected to Static page.
          </div>
        </div>
        <div class="rule">
          <div class="ruleIcon">🚫</div>
          <div class="ruleText">
            <strong>Trying to go to Query page:</strong> Navigation will be prevented.
          </div>
        </div>
      </div>

      <div class="navigation">
        <h2>Navigation</h2>
        <Link payload={{ name: 'static' }} class="navButton">
          Go to Static Page
        </Link>
        <Link payload={{ name: 'dynamic', params: { foo: 'example' } }} class="navButton">
          Go to Dynamic Page
        </Link>
        <Link
          payload={{ name: 'query', query: { foo: 'example' } }}
          class="navButton navButtonBlocked"
        >
          Try to go to Query Page (will be blocked)
        </Link>
      </div>
    </div>
  );
}
