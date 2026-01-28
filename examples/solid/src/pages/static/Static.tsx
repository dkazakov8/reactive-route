import { Link } from '../../components/Link';

export default function Static() {
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
        <Link payload={{ name: 'dynamic', params: { foo: 'example' } }} class="nav-button">
          Go to Dynamic Page
        </Link>
        <Link payload={{ name: 'query', query: { foo: 'example' } }} class="nav-button">
          Go to Query Page
        </Link>
        <Link payload={{ name: 'preventRedirect' }} class="nav-button">
          Go to Prevent Page
        </Link>
      </div>
    </div>
  );
}
