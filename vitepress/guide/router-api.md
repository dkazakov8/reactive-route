# Router API

## createRouter

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>routes</code></td>
<td class="table-td">

```ts
ReturnType<typeof createRoutes>
```

</td>
<td>An object with <code>Configs</code></td>
</tr><tr>
<td><code>adapters</code></td>
<td class="table-td">

[TypeAdapters](#typeadapters)

</td>
<td>Adapters for the reactivity system</td>
</tr><tr>
<td><code>beforeComponentChange?</code></td>
<td class="table-td">

```ts
(params: {
  prevState?: TypeRouteState;
  prevConfig?: TypeRouteConfig;
  currentState: TypeRouteState;
  currentConfig: TypeRouteConfig;
}) => void
```

</td>
<td>This is a global lifecycle function that executes only when the rendered component changes (not route!)</td>
  </tr></tbody>
</table>

For all the next examples we will use this configuration:

```ts
createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => value.length > 0,
    },
    query: {
      phone: (value) => value.length > 0,
    },
    loader: () => import('./pages/user'),
  },
  
  // other Configs
});
```

## router.redirect

Navigates to a specified `Payload` and returns a `url` from a newly created `State`:

```typescript
const clearedURL = await router.redirect(<!-- @include: ../snippets/payload.md -->)
// router.state.user was created and returned it's url
// clearedURL === '/user/9999?phone=123456'


```

This function is fully typed, and TypeScript hints will be shown for autocomplete.

```typescript
// Good
redirect({ route: 'home' })
redirect({ route: 'user', params: { id: '123' } })
redirect({ route: 'user', params: { id: '123' }, query: { phone: '321' } })

// TS errors

// no "route" key
redirect({});
// no Config with this name
redirect({ route: 'nonExisting' });
// home Config is a static route, params should not be passed
redirect({ route: 'home', params: {} });
// user Config is a dynamic route, params should be present
redirect({ route: 'user' });
// params.id should be present
redirect({ route: 'user', params: {} });
// not existing params.a was passed
redirect({ route: 'user', params: { id: '123', a: 'b' } });
// not existing query.a was passed
redirect({ route: 'user', params: { id: '123' }, query: { a: 'b' } });
```

## router.createRoutePayload

Accepts a pathname+search string and returns `Payload`. If no matching `Config` is found,
the `notFound` `Payload` will be returned with empty `params` and `query`.

Note that all irrelevant or invalid query parameters are stripped off.

```ts
router.createRoutePayload(`/user/9999?phone=123456&gtm=value`)
<!-- @include: ../snippets/payload-commented.md -->

router.createRoutePayload(`/not-existing/admin?hacker=sql-inject`)
// { 
//  route: 'notFound', 
//  params: {}, 
//  query: {}
// }
```

## router.createRouteState

Accepts a `Payload` and returns a `State`. It is perfectly TS-typed just like `router.redirect`.

```ts
router.createRouteState(<!-- @include: ../snippets/payload.md -->)
<!-- @include: ../snippets/state-commented.md -->
```


## router.hydrateFromURL

Just an alias for `router.redirect(router.createRoutePayload(locationString))`.
So, it accepts a pathname+search string and returns a `url` from a newly created `State`.

Note that all irrelevant or invalid query parameters are stripped off.

```ts
const clearedURL = await router.hydrateFromURL(
  `/user/9999?phone=123456&gtm=value`
)
// router.state.user was created and returned it's url
// clearedURL === '/user/9999?phone=123456'

// in CSR is usually used like this
await router.hydrateFromURL(`${location.pathname}${location.search}`)

// in SSR is usually used like this (with Express.js)
const clearedURL = await router.hydrateFromURL(req.originalUrl)
// if you want to remove irrelevant query params 
// and unify slashes format
if (req.originalUrl !== clearedURL) res.redirect(clearedURL)
```

## router.hydrateFromState

Accepts a `router.state` from an object and makes all the necessary preparations for rendering.

```ts
const stateFromServer = window.__ROUTER_STATE__;

// what is expected from the server
stateFromServer.user = <!-- @include: ../snippets/state.md -->

await router.hydrateFromState({ state: stateFromServer })
```

This function is intended to be used with SSR, so it does not call any lifecycle functions because
they have already been called on server. So use it only to restore state from the server.

## router.state

A **reactive** object with route names as keys and `State` as values, for example:

```ts
console.log(router.state.user)
<!-- @include: ../snippets/state-commented.md -->
```

Is intended to be used to show some values in UI or for writing logic in autoruns/effects. When
you redirect to the same route with different params or query, only the values in `router.state.user`
will be updated, and no page component will be re-rendered.

::: tip
The router **does not** automatically destroy the old `State` when you redirect to another route.
So, it will be always there, but with `isActive: false` parameter. If you want to save some bytes of memory,
you can destroy the old `State` manually in [beforeComponentChange](#beforecomponentchange). This is
made for stability reasons when you have async functions or autoruns attached to some inactive state.
:::

## router.isRedirecting

A reactive boolean parameter that helps with showing loaders on redirects.

::: code-group
```tsx [React]
// If you want a global "loading line" on top of page
// or an overlay on the whole page
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return router.isRedirecting ? <Loader /> : null;
}

// If you want a local spinner in some button
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```tsx [Preact]
// If you want a global "loading line" on top of page
// or an overlay on the whole page
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return router.isRedirecting ? <Loader /> : null;
}

// If you want a local spinner in some button
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```tsx [Solid]
// If you want a global "loading line" on top of page
// or an overlay on the whole page
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return <Show when={router.isRedirecting}><Loader/></Show>;
}

// If you want a local spinner in some button
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```vue [Vue]
<script lang="ts" setup>
  import { useRouterStore } from '../../router';

  const { router } = useRouterStore();
</script>

<template>
  <!-- 
    If you want a global "loading line" on top of page
    or an overlay on the whole page 
  -->
  <Loader v-if="router.isRedirecting" />
  
  <!-- If you want a local spinner in some button -->
  <Button :is-loading="router.isRedirecting">
    Submit
  </Button>
</template>
```
:::

## router.getActiveRouteState

Returns the current `State` of the active route, if any. May be useful when you have several
global layouts above the Router component.

::: code-group
```tsx [React]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);
  
  const activeStateName = router.getActiveRouteState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
    ? LayoutLogin 
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Preact]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);
  
  const activeStateName = router.getActiveRouteState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
    ? LayoutLogin 
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Solid]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);

  const activeStateName = () => router.getActiveRouteState()?.name;

  return (
    <Dynamic 
      component={['login', 'restore', 'checkSms'].includes(activeStateName()) 
        ? LayoutLogin 
        : LayoutAuthZone
      }
    >
      <Router router={router} />
    </Dynamic>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouterStore } from '../../router';
  
  import LayoutLogin from 'layouts/LayoutLogin.vue'
  import LayoutAuthZone from 'layouts/LayoutAuthZone.vue'

  const { router } = useRouterStore();

  const activeStateName = computed(() => router.getActiveRouteState()?.name);
  
  const Layout = computed(() => 
    ['login', 'restore', 'checkSms'].includes(activeStateName.value) 
      ? LayoutLogin 
      : LayoutAuthZone
  );
</script>

<template>
  <component :is="Layout">
    <Router :router="router" />
  </component>
</template>
```
:::

Or to connect Dev Tools to the router to see all the changes. Currently no built-in Dev Tools
are provided, but you can effortlessly debug with

```ts
// use the analog of autorun in your reactive system
autorun(() => console.log(JSON.stringify(router.getActiveRouteState())))
```

## router.preloadComponent

By default, the router will load the component only during redirects. But sometimes you may want
to preload the component programmatically. This is useful only when code splitting is enabled in
your bundler.

```ts
// initiate as usual
await router.hydrateFromURL(location.pathname + location.search);

// preload when the network is idle and the page is fully rendered
setTimeout(async () => {
  try {
    await router.preloadComponent('login')
    await router.preloadComponent('dashboard')
  } catch(e) {
    console.error('Seems like the user lost connection')
  }
}, 5000)
```

## beforeComponentChange

This lifecycle function is called only when the rendered component changes (not route!) and is
intended to be used for modular architectures. For example, if some page exports a modular
store like `export class PageStore { data: {}, destroy() {} }`

```ts
const globalStore = { pages: {} };

createRouter({
  routes,
  adapters,
  beforeComponentChange({ prevConfig, currentConfig }) {
    const ExportedPageStore = currentConfig.otherExports.PageStore;
    
    if (ExportedPageStore) {
      globalStore.pages[currentConfig.name] = new ExportedPageStore();
    }
    
    // now check the previous page store and destroy it if needed
    globalStore.pages[prevConfig.name]?.destroy();
      
    delete globalStore.pages[prevConfig.name];
  }
})
```

Then you just pass `globalStore` to your pages with Context and get code-splitting for modular
stores. Also, this function may be used for cancelling async functions and API calls.

::: tip
Destroying in most cases should be delayed until all async logic is completed, otherwise it may
try to read non-existent `globalStore.pages[prevConfig.name]`.
:::

## Types

### TypeAdapters

You may pass your own adapters if they satisfy the exported type.
This may be useful for integration of your own reactivity system.

<<< @/../packages/core/types.ts#type-adapters{typescript}