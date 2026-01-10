import { useContext } from 'preact/hooks';

import { RouterContext } from '../../router';

export default function Prevent() {
  const { router } = useContext(RouterContext);

  return (
    <div className="page-container prevent-page">
      <h1>Prevent Redirect Page</h1>

      <div className="route-info">
        <h2>Route Configuration</h2>
        <pre>
          {`preventRedirect: {
  path: '/prevent',
  async beforeEnter(config) {
    if (config.currentState?.name === 'dynamic') {
      return config.redirect({ route: 'static' });
    }
  },
  async beforeLeave(config) {
    if (config.nextState.name === 'query') {
      return config.preventRedirect();
    }
  },
  loader: () => import('./pages/prevent'),
}`}
        </pre>
      </div>

      <div className="route-description">
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

      <div className="navigation-rules">
        <h2>Navigation Rules</h2>
        <div className="rule">
          <div className="rule-icon">⚠️</div>
          <div className="rule-text">
            <strong>Coming from Dynamic page:</strong> You will be redirected to Static page.
          </div>
        </div>
        <div className="rule">
          <div className="rule-icon">🚫</div>
          <div className="rule-text">
            <strong>Trying to go to Query page:</strong> Navigation will be prevented.
          </div>
        </div>
      </div>

      <div className="navigation">
        <h2>Navigation</h2>
        <button onClick={() => router.redirect({ route: 'static' })} className="nav-button">
          Go to Static Page
        </button>
        <button
          onClick={() => router.redirect({ route: 'dynamic', params: { foo: 'example' } })}
          className="nav-button"
        >
          Go to Dynamic Page
        </button>
        <button
          onClick={() => router.redirect({ route: 'query', query: { foo: 'example' } })}
          className="nav-button nav-button-blocked"
        >
          Try to go to Query Page (will be blocked)
        </button>
      </div>
    </div>
  );
}
