<script lang="ts" setup>
import { useRouterStore } from '../../router';

const { router } = useRouterStore();
</script>

<template>
  <div class="page-container static-page">
    <h1>Static Page</h1>

    <div class="route-info">
      <h2>Route Configuration</h2>
      <pre>static: {
  path: '/static',
  loader: () => import('./pages/static'),
}</pre>
    </div>

    <div class="route-description">
      <h2>How it works</h2>
      <p>
        This is a simple static route with a fixed path. When you navigate to '/static', the router
        loads this component using the loader function.
      </p>
      <p>The home page ('/') automatically redirects to this page using a beforeEnter hook.</p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <button @click="router.redirect({ route: 'dynamic', params: { foo: 'example' } })" class="nav-button">Go to Dynamic Page</button>
      <button @click="router.redirect({ route: 'query', query: { foo: 'example' } })" class="nav-button">Go to Query Page</button>
      <button @click="router.redirect({ route: 'preventRedirect' })" class="nav-button">Go to Prevent Page</button>
    </div>
  </div>
</template>
