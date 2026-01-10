import { useContext } from 'preact/hooks';

import { RouterContext } from '../../router';

export default function Static() {
  const { router } = useContext(RouterContext);

  return (
    <div className="page-container static-page">
      <h1>Static Page</h1>

      <div className="route-info">
        <h2>Route Configuration</h2>
        <pre>
          {`static: {
  path: '/static',
  loader: () => import('./pages/static'),
}`}
        </pre>
      </div>

      <div className="route-description">
        <h2>How it works</h2>
        <p>
          This is a simple static route with a fixed path. When you navigate to '/static', the
          router loads this component using the loader function.
        </p>
        <p>The home page ('/') automatically redirects to this page using a beforeEnter hook.</p>
      </div>

      <div className="navigation">
        <h2>Navigation</h2>
        <button
          onClick={() => router.redirect({ route: 'dynamic', params: { foo: 'example' } })}
          className="nav-button"
        >
          Go to Dynamic Page
        </button>
        <button
          onClick={() => router.redirect({ route: 'query', query: { foo: 'example' } })}
          className="nav-button"
        >
          Go to Query Page
        </button>
        <button
          onClick={() => router.redirect({ route: 'preventRedirect' })}
          className="nav-button"
        >
          Go to Prevent Page
        </button>
      </div>
    </div>
  );
}
