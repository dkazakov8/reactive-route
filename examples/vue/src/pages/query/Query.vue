<script lang="ts" setup>
import { useRouterStore } from '../../router';

const { router } = useRouterStore();

const routeState = router.state.query!;

function goRandom() {
  void router.redirect({
    route: 'query',
    query: { foo: String(Math.random()).slice(2, 10) },
  });
}
</script>

<template>
  <div class="page-container query-page">
    <h1>Query Page</h1>

    <div class="route-info">
      <h2>Route Configuration</h2>
      <pre>query: {
  path: '/query',
  query: {
    foo: (value: string) => value.length > 2,
  },
  loader: () => import('./pages/query'),
}</pre>
    </div>

    <div class="route-info">
      <h2>Current Query</h2>
      <pre>{{ JSON.stringify(routeState.query, null, 2) }}</pre>
    </div>

    <div class="actions">
      <h2>Actions</h2>
      <button type="button" class="nav-button" @click="goRandom">Go to random query value</button>
      <p class="note">
        Update query parameter and observe route changes.
      </p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <button @click="router.redirect({ route: 'static' })" class="nav-button">Go to Static Page</button>
      <button @click="router.redirect({ route: 'dynamic', params: { foo: 'example' } })" class="nav-button">Go to Dynamic Page</button>
      <button @click="router.redirect({ route: 'preventRedirect' })" class="nav-button">Go to Prevent Page</button>
    </div>
  </div>
</template>
