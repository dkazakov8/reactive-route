<script lang="ts" setup>
import Link from '../../components/Link.vue';
</script>

<template>
  <div class="pageContainer preventPage">
    <h1>Prevent Redirect Page</h1>

    <div class="routeInfo">
      <h2>Route Configuration</h2>
      <pre>preventRedirect: {
  path: '/prevent',
  async beforeEnter({ currentState, redirect }) {
    if (currentState?.name === 'dynamic') {
      return redirect({ name: 'static' });
    }
  },
  async beforeLeave({ nextState, preventRedirect }) {
    if (nextState.name === 'query') {
      return preventRedirect();
    }
  },
  loader: () => import('./pages/prevent'),
}</pre>
    </div>

    <div class="routeDescription">
      <h2>How it works</h2>
      <p>
        This page demonstrates route guards: navigating here from Dynamic redirects to Static;
        leaving to Query is prevented.
      </p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <Link :payload="{ name: 'static' }" class="navButton">Go to Static Page</Link>
      <Link :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="navButton">
        Go to Dynamic Page
      </Link>
      <Link
        :payload="{ name: 'query', query: { foo: 'example' } }"
        class="navButton navButtonBlocked"
      >
        Try to go to Query Page (will be blocked)
      </Link>
    </div>
  </div>
</template>
