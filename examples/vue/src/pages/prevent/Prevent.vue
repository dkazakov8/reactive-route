<script lang="ts" setup>
import Link from '../../components/Link.vue';
</script>

<template>
  <div class="page-container prevent-page">
    <h1>Prevent Redirect Page</h1>

    <div class="route-info">
      <h2>Route Configuration</h2>
      <pre>preventRedirect: {
  path: '/prevent',
  async beforeEnter(config) {
    if (config.currentState?.name === 'dynamic') {
      return config.redirect({ name: 'static' });
    }
  },
  async beforeLeave(config) {
    if (config.nextState.name === 'query') {
      return config.preventRedirect();
    }
  },
  loader: () => import('./pages/prevent'),
}</pre>
    </div>

    <div class="route-description">
      <h2>How it works</h2>
      <p>
        This page demonstrates route guards: navigating here from Dynamic redirects to Static;
        leaving to Query is prevented.
      </p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <Link :payload="{ name: 'static' }" class="nav-button">Go to Static Page</Link>
      <Link :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="nav-button">
        Go to Dynamic Page
      </Link>
      <Link
        :payload="{ name: 'query', query: { foo: 'example' } }"
        class="nav-button nav-button-blocked"
      >
        Try to go to Query Page (will be blocked)
      </Link>
    </div>
  </div>
</template>
