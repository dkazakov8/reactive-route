<script lang="ts" setup>
</script>

<template>
  <div class="pageContainer homePage">
    <h1>Home Page</h1>

    <div class="redirectNotice">
      <div class="redirectIcon">⏱️</div>
      <div class="redirectMessage">
        <p>This page will automatically redirect to the Static page</p>
        <p>
          This is because of the <code>beforeEnter</code> hook in the route configuration.
        </p>
      </div>
    </div>

    <div class="routeInfo">
      <h2>Route Configuration</h2>
      <pre>home: {
  path: '/',
  loader: () => import('./pages/home'),
  async beforeEnter({ redirect }) {
    return redirect({ name: 'static' });
  },
}</pre>
    </div>

    <div class="routeDescription">
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
</template>
