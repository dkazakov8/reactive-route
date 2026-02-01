import { Link } from '../../components/Link';

export default function Error(props: { errorCode: number }) {
  return (
    <div className="pageContainer errorPage">
      <div className="errorContainer">
        <div className={`errorCode ${props.errorCode === 404 ? 'errorCode404' : 'errorCode500'}`}>
          {props.errorCode}
        </div>
        <h1>{props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error'}</h1>
      </div>

      <div className="routeInfo">
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

      <div
        className={`routeDescription ${props.errorCode === 404 ? 'routeDescription404' : 'routeDescription500'}`}
      >
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
        <Link payload={{ name: 'static' }} className="navButton">
          Go to Static Page
        </Link>
        <Link payload={{ name: 'dynamic', params: { foo: 'example' } }} className="navButton">
          Go to Dynamic Page
        </Link>
        <Link payload={{ name: 'query', query: { foo: 'example' } }} className="navButton">
          Go to Query Page
        </Link>
        <Link payload={{ name: 'preventRedirect' }} className="navButton">
          Go to Prevent Page
        </Link>
      </div>
    </div>
  );
}
