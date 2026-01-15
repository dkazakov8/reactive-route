# Core Concepts

There are only three structures in the library - `Config`, `Payload` and `State`:

## Config

Is a configuration object you pass to the `createRoutes` function for route names.
It usually looks like this:

```tsx
{
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  query: {
    phone: (value) => value.length < 15
  },
  loader: () => import('./pages/user'),
  async beforeEnter({ redirect }) {
    await api.loadUser();

    if (store.isAuthenticated()) return redirect({ name: 'dashboard' });
  },
  async beforeLeave({ nextRoute, preventRedirect }) {
    if (nextRoute.name === 'home') return preventRedirect();
  }
}
```

When you redirect to another route, the library executes `loader` and extends this configuration 
with some other fields like `name`, `component` and `otherExports`, so they can be used in lifecycle
methods and for internal caching.

## Payload

Is an object containing all the relevant information to detect a `Config`
and fill it with values. It usually looks like this:

```tsx
<!-- @include: ../snippets/payload.md -->
```

It can be created from a string with [router.createRoutePayload](/guide/router-api#router-createroutepayload), 
but usually you will pass it manually to the [router.redirect](/guide/router-api#router-redirect) 
function imperatively:

```tsx
button.onclick = () => router.redirect(<!-- @include: ../snippets/payload.md -->)
```

## State

Is an object containing additional information compared to `Payload`.

```ts
<!-- @include: ../snippets/state.md -->
```

It is kept in `router.state` in a **reactive** way and can be accessed from any UI component like this:

::: code-group
```tsx [React]
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
```tsx [Preact]
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
```tsx [Solid]
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
```vue [Vue]
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
definitely exist if only one route uses this page component. Otherwise, choose the relevant one
like `routeState = router.state.userView || router.state.userEdit`, but there are
better alternatives to this.

This object can also be constructed manually from `Payload` with [router.createRouteState](/guide/router-api#router-createroutestate).

That is useful for creating `Link` components where you can use `<a href={routeState.url} />` for
better UX and SEO or when JS is disabled in browser.

## Encoding

In Reactive Route the router handles the process of encoding and decoding in this way
(imagine we disabled numeric validation for `id`):

```ts
await router.hydrateFromURL(`/user/with%20space?phone=and%26symbols`);

// under the hood it calls router.createRoutePayload to create a Payload
// with decoded values
// {
//   name: 'user', 
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' }
// }

// during redirect a router.createRouteState is called
// which encodes params back to URL
console.log(router.state.user)
// {
//   name: 'test',
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' },
//
//   pathname: '/user/with%20space',
//   search: 'phone=and%26symbols',
//   url: '/user/with%20space?phone=and%26symbols',
//
//   props: undefined,
//   isActive: true,
// }
```

So, the process is double-sided. `createRoutePayload` validates and decodes, while `createRouteState`
validates and encodes to ensure safety, prevent malformed values and produce correct URLs.