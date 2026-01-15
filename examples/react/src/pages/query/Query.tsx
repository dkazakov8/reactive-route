import { useContext } from 'react';

import { RouterContext } from '../../router';

export default function Query() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.query!;

  return (
    <div className="page-container query-page">
      <h1>Query Page</h1>

      <div className="route-info">
        <h2>Route Configuration</h2>
        <pre>
          {`query: {
  path: '/query',
  query: {
    foo: (value: string) => value.length > 2,
  },
  loader: () => import('./pages/query'),
}`}
        </pre>
      </div>

      <div className="current-query">
        <h2>Current Query Parameters</h2>
        <pre>{JSON.stringify(routeState.query, null, 2)}</pre>
      </div>

      <div className="route-description">
        <h2>How it works</h2>
        <p>
          This route demonstrates query parameter validation. The route has a fixed path '/query',
          but it validates the query parameter <code>foo</code> to ensure it's not empty.
        </p>
        <p>
          When you navigate to a URL like '/query?foo=example', the router extracts 'example' as the
          value of the 'foo' query parameter, validates it, and if valid, loads this component.
        </p>
        <p>
          If you try to navigate to '/query' (without the 'foo' parameter) or '/query?foo=', the
          route will still match but the validation for the query parameter will fail.
        </p>
        <p>
          Unlike route parameters, query parameters are optional by default and don't affect the
          route matching.
        </p>
      </div>

      <div className="actions">
        <h2>Actions</h2>
        <button
          type="button"
          className="action-button"
          onClick={() => {
            void router.redirect({
              name: 'query',
              query: { foo: String(Math.random()).slice(2, 10) },
            });
          }}
        >
          Go to random query value
        </button>
        <p className="note">
          Click button and see the page update with new query parameters. With SSR we don't even
          look at URL on frontend during hydration, just restore from the server.
        </p>
      </div>

      <div className="navigation">
        <h2>Navigation</h2>
        <button onClick={() => router.redirect({ name: 'static' })} className="nav-button">
          Go to Static Page
        </button>
        <button
          onClick={() => router.redirect({ name: 'dynamic', params: { foo: 'example' } })}
          className="nav-button"
        >
          Go to Dynamic Page
        </button>
        <button onClick={() => router.redirect({ name: 'preventRedirect' })} className="nav-button">
          Go to Prevent Page
        </button>
      </div>
    </div>
  );
}
