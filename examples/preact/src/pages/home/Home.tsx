export default function Home() {
  return (
    <div className="pageContainer homePage">
      <h1>Home Page</h1>

      <div className="redirectNotice">
        <div className="redirectIcon">⏱️</div>
        <div className="redirectMessage">
          <p>This page will automatically redirect to the Static page</p>
          <p>
            This is because of the <code>beforeEnter</code> hook in the route configuration.
          </p>
        </div>
      </div>

      <div className="routeInfo">
        <h2>Route Configuration</h2>
        <pre>
          {`home: {
  path: '/',
  loader: () => import('./pages/home'),
  async beforeEnter({ redirect }) {
    return redirect({ name: 'static' });
  },
}`}
        </pre>
      </div>

      <div className="routeDescription">
        <h2>How it works</h2>
        <p>
          This is the home page with the path '/'. However, it has a <code>beforeEnter</code> hook
          that immediately redirects to the Static page.
        </p>
        <p>
          The <code>beforeEnter</code> hook is called before the page is rendered, so normally you
          would never see this page. For demonstration purposes, we've added a 5-second delay before
          redirecting.
        </p>
        <p>
          This pattern is useful when you want to redirect users from one route to another based on
          certain conditions, such as authentication status.
        </p>
      </div>
    </div>
  );
}
