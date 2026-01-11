# Core Concepts

There are only three public structures in the library - `Config`, `Payload` and `State`:

## Route `Config`

Is a configuration object you pass to the `createRoutes` function for route names.
It usually looks like this:

```tsx
{
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  query: {
    phone: (value) => value.length < 10
  },
  loader: () => import('./pages/user'),
  async beforeEnter({ redirect }) {
    await api.loadUser();

    if (isAuthenticated()) return redirect({ route: 'dashboard' });
  },
  async beforeLeave({ nextRoute, preventRedirect }) {
    if (nextRoute.name === 'home') return preventRedirect();
  }
}
```

When you redirect to another route, the library executes `loader` and extends this configuration 
with some other fields like `name`, `component` and `otherExports`, so they can be used in lifecycle
methods and for internal caching.

## Route `Payload`

Is an object containing all the relevant information to detect a Route Config
and fill it with values. It usually looks like this:

```tsx
{ 
  route: 'user', 
  params: { id: '9999' }, 
  query: { phone: '123456' } 
}
```

There are two functions to create it from string: `router.createRoutePayload` and `router.hydrateFromURL`
(an alias for creating a payload and redirecting). They will automatically find a relevant route config
and validate all the params and query values, like

```tsx
console.log(router.createRoutePayload(`/user/9999?phone=123456`))

// { 
//  route: 'user', 
//  params: { id: '9999' }, 
//  query: { phone: '123456' }
// }
```

But usually you will pass a Route `Payload` manually to the `router.redirect` function in an imperative way:

```tsx
button.onclick = () => router.redirect({
  route: 'user',
  params: { id: '9999' },
  query: { phone: '123456' }
})
```

## Route `State`

Is an object containing all the relevant information to render a route and looks like this:

```ts
{
  name: 'user', 
  params: { id: '9999' },
  pathname: '/user/9999',
  props: undefined,
  query: { phone: '123456' },
  search: 'phone=123456',
  url: '/user/9999?phone=123456',
}
```

It is kept in `router.state` in a **reactive** way and can be accessed from any UI component like this:

::: code-group
```tsx [react]
// pages/user/index.tsx
import { useContext } from 'react';
import { RouterContext } from '../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [preact]
// pages/user/index.tsx
import { useContext } from 'preact';
import { RouterContext } from '../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;

  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [solid]
// pages/user/index.tsx
import { useContext } from 'solid-js';
import { RouterContext } from '../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  return (
    <>
      ID: {router.state.user!.params.id}
      Phone: {router.state.user!.query.phone}
    </>
  )
}
```
```vue [vue]
// pages/user/User.vue
<script lang="ts" setup>
  import { useRouterStore } from '../../router';

  const { router } = useRouterStore();

  const routeState = router.state.user!;
</script>

<template>
  ID: {routeState.params.id}
  Phone: {routeState.query.phone}
</template>
```
:::

Do not worry about the "non-null assertion" operator `!` - the relevant route's state will 
definetely exist if only one route uses this page component. Otherwise, choose the relevant one
like `routeState = router.state.userView || router.state.userEdit`, but there are
better alternatives to this.

This object can also be constructed manually from `Payload` with `router.createRouteState`:

```ts
console.log(router.createRouteState({
  route: 'user',
  params: { id: '9999' },
  query: { phone: '123456' }
}))

// {
//   name: 'user', 
//   params: { id: '9999' },
//   pathname: '/user/9999',
//   props: undefined,
//   query: { phone: '123456' },
//   search: 'phone=123456',
//   url: '/user/9999?phone=123456',
// }
```

That is useful in creating `Link` components where you can use `<a href={routeState.url} />` for
better UX and SEO or when JS is disabled in browser.

The next documentation sections will describe these three simple structures in detail.