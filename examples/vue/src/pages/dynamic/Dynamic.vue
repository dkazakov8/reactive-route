<script lang="ts" setup>
import { useStore } from '../../components/useStore';

const { router } = useStore();

const activeRouteState = router.state.dynamic!;

function goRandom() {
  void router.redirect({
    route: 'dynamic',
    params: { foo: String(Math.random()).slice(2, 10) },
  });
}
</script>

<template>
  <div class="page-container dynamic-page">
    <h1>Dynamic Page</h1>

    <div class="route-info">
      <h2>Route Configuration</h2>
      <pre>dynamic: {
  path: '/page/:foo',
  params: {
    foo: (value: string) => value.length > 2,
  },
  loader: () => import('./pages/dynamic'),
}</pre>
    </div>

    <div class="route-info">
      <h2>Current Parameters</h2>
      <pre>{{ JSON.stringify(activeRouteState.params, null, 2) }}</pre>
    </div>

    <div class="route-description">
      <h2>How it works</h2>
      <p>
        This is a dynamic route with a parameter <code>:foo</code> in the path. The parameter is
        validated to ensure it's longer than 2 characters.
      </p>
      <p>
        When you navigate to a URL like '/page/example', the router extracts 'example' as the value
        of the 'foo' parameter, validates it, and if valid, loads this component.
      </p>
      <p>
        If you try to navigate to '/page/ab' (where 'foo' is only 2 characters), the route won't
        match because the validation fails.
      </p>
    </div>

    <div class="actions">
      <h2>Actions</h2>
      <button type="button" class="nav-button" @click="goRandom">Go to random dynamic value</button>
      <p class="note">
        Click button and see the page update with new parameters. With SSR we don't even look at URL
        on frontend during hydration, just restore from the server.
      </p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <button @click="router.redirect({ route: 'static' })" class="nav-button">Go to Static Page</button>
      <button @click="router.redirect({ route: 'query', query: { foo: 'example' } })" class="nav-button">Go to Query Page</button>
      <button @click="router.redirect({ route: 'preventRedirect' })" class="nav-button">Go to Prevent Page (will redirect to Static)</button>
    </div>
  </div>
</template>
