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
<td>An object with Route <code>Configs</code></td>
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

Note that all the unrelevant or invalid query parameters are stripped off.

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

Note that all the unrelevant or invalid query parameters are stripped off.

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
// if you want to remove the unrelevant query params 
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
console.log(route.state.user)
<!-- @include: ../snippets/state-commented.md -->
```

Is intended to be used to show some values in UI or for writing logic in autoruns/effects. When
you redirect to the same route with different params or query, only the values in `route.state.user`
will be updated, and no page component will be re-rendered.

## router.isRedirecting

A reactive boolean parameter that helps with showing loaders on redirects.

::: code-group
```tsx [react]
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
```tsx [preact]
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
```tsx [solid]
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
```vue [vue]
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

## Types

### TypeAdapters

You may pass your own adapters if they satisfy the exported type.
This may be useful for integration of your own reactivity system.

<<< @/../packages/core/types.ts#type-adapters{typescript}