import { useContext } from 'preact/hooks';

import { StoreContext } from '../../components/StoreContext';

export default function Error(props: { errorCode: number }) {
  const { router } = useContext(StoreContext);

  return (
    <div className="page-container">
      <div className="error-container">
        <div className="error-code">{props.errorCode}</div>
        <h1>{props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error'}</h1>
      </div>

      <div className="route-info">
        <h2>Route Configuration</h2>
        <pre>
          {props.errorCode === 404
            ? `notFound: {
  path: '/error404',
  props: { errorCode: 404 },
  loader: () => import('./pages/error'),
}`
            : `internalError: {
  path: '/error500',
  props: { errorCode: 500 },
  loader: () => import('./pages/error'),
}`}
        </pre>
      </div>

      <div className="route-description">
        <h2>How it works</h2>
        <p>
          This is an error page that handles both 404 (Not Found) and 500 (Internal Server Error)
          errors. The router passes the error code as a prop to this component.
        </p>
        <p>
          When a route is not found or when an internal error occurs, the router automatically
          redirects to the appropriate error page.
        </p>
        {props.errorCode === 404 ? (
          <p>
            The 404 page is shown when a user tries to navigate to a URL that doesn't match any
            defined route.
          </p>
        ) : (
          <p>
            The 500 page is shown when an unexpected error occurs during route processing or
            component rendering.
          </p>
        )}
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
