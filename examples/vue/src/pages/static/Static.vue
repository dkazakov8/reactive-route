<script lang="ts" setup>
import Link from '../../components/Link.vue';
</script>

<template>
  <div class="pageContainer staticPage">
    <h1>Static Page</h1>

    <div class="routeInfo">
      <h2>Route Configuration</h2>
      <pre>static: {
  path: '/static',
  loader: () => import('./pages/static'),
}</pre>
    </div>

    <div class="routeDescription">
      <h2>How it works</h2>
      <p>
        This is a simple static route with a fixed path. When you navigate to '/static', the router
        loads this component using the loader function.
      </p>
      <p>The home page ('/') automatically redirects to this page using a beforeEnter hook.</p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <Link :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="navButton">
        Go to Dynamic Page
      </Link>
      <Link :payload="{ name: 'query', query: { foo: 'example' } }" class="navButton">
        Go to Query Page
      </Link>
      <Link :payload="{ name: 'preventRedirect' }" class="navButton">
        Go to Prevent Page
      </Link>
    </div>
  </div>
</template>
