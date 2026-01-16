import { useRouter } from '../../router';

export default function Dynamic() {
  const { router } = useRouter();

  const routeState = router.state.dynamic!;

  return (
    <div className="page-container dynamic-page">
      <h1>Dynamic Page</h1>

      <div className="route-info">
        <h2>Route Configuration</h2>
        <pre>
          {`dynamic: {
  path: '/page/:foo',
  params: {
    foo: (value: string) => value.length > 2,
  },
  loader: () => import('./pages/dynamic'),
}`}
        </pre>
      </div>

      <div className="route-info">
        <h2>Current Parameters</h2>
        <pre>{JSON.stringify(routeState.params, null, 2)}</pre>
      </div>

      <div className="route-description">
        <h2>How it works</h2>
        <p>
          This is a dynamic route with a parameter <code>:foo</code> in the path. The parameter is
          validated to ensure it's longer than 2 characters.
        </p>
        <p>
          When you navigate to a URL like '/page/example', the router extracts 'example' as the
          value of the 'foo' parameter, validates it, and if valid, loads this component.
        </p>
        <p>
          If you try to navigate to '/page/ab' (where 'foo' is only 2 characters), the route won't
          match because the validation fails.
        </p>
      </div>

      <div className="actions">
        <h2>Actions</h2>
        <button
          type="button"
          className="nav-button"
          onClick={() => {
            void router.redirect({
              name: 'dynamic',
              params: { foo: String(Math.random()).slice(2, 10) },
            });
          }}
        >
          Go to random dynamic value
        </button>
        <p className="note">
          Click button and see the page update with new parameters. With SSR we don't even look at
          URL on frontend during hydration, just restore from the server.
        </p>
      </div>

      <div className="navigation">
        <h2>Navigation</h2>
        <button onClick={() => router.redirect({ name: 'static' })} className="nav-button">
          Go to Static Page
        </button>
        <button
          onClick={() => router.redirect({ name: 'query', query: { foo: 'example' } })}
          className="nav-button"
        >
          Go to Query Page
        </button>
        <button onClick={() => router.redirect({ name: 'preventRedirect' })} className="nav-button">
          Go to Prevent Page (will redirect to Static)
        </button>
      </div>
    </div>
  );
}
