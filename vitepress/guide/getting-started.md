# Getting Started

## Installation

The all-in-one package includes everything needed to use Reactive Route.

::: code-group
```sh [npm]
npm i reactive-route
```

```sh [yarn]
yarn add reactive-route
```

```sh [pnpm]
pnpm add reactive-route
```
:::

## Modules map

<<< @/modulesMap.ts

## Router Store and Routes

First, create a router store using the `createRouter` function and your routes configuration using 
the `createRoutes` function. 

Routes `notFound` and `internalError` are required for error handling in the library, their 
configuration is partially customizable (no `params` and `query` are allowed).

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

::: code-group
```tsx [react]
// router.tsx
import { createContext } from 'react';
<!-- @include: ../snippets/get-router.md -->

export const RouterContext = createContext<{ 
  router: ReturnType<typeof getRouter> 
}>(undefined);
```

```tsx [preact]
// router.tsx
import { createContext } from 'preact';
<!-- @include: ../snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);
```

```tsx [solid]
// router.tsx
import { createContext } from 'solid-js';
<!-- @include: ../snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);
```

```ts [vue]
// router.ts
import { InjectionKey, inject } from 'vue';
<!-- @include: ../snippets/get-router.md -->

export const routerStoreKey: InjectionKey<{ 
  router: ReturnType<typeof getRouter> 
}> = Symbol();

export const useRouterStore = () => inject(routerStoreKey)!;
```
:::

## Router Component and Context providing

In this tutorial we will use CSR (client-only rendering) by using `router.hydrateFromURL` function.
[SSR](/guide/ssr) version is very similar, but uses `router.hydrateFromServer` and relevant `hydrate` functions from
UI frameworks.

<Tabs :frameworks="['react', 'preact', 'solid', 'vue']">
<template #react>

::: code-group
```tsx [App.tsx]
import { useContext } from 'react';
import { Router } from 'reactive-route/react';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createRoot(document.getElementById('app')!).render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
:::

</template>
<template #preact>

::: code-group
```tsx [App.tsx]
import { useContext } from 'preact';
import { Router } from 'reactive-route/preact';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'preact';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
:::

</template>
<template #solid>

::: code-group
```tsx [App.tsx]
import { useContext } from 'solid-js';
import { Router } from 'reactive-route/solid';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'solid-js/web';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  () => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ),
  document.getElementById('app')!
);
```
:::

</template>
<template #vue>

::: code-group
```vue [App.vue]
<script lang="ts" setup>
  import { Router } from 'reactive-route/vue';

  import { useRouterStore } from './router';

  const { router } = useRouterStore();
</script>

<template>
  <Router :router="router" />
</template>
```
```ts [entry.ts]
import { createApp } from 'vue';

import App from './App.vue';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::

</template>
</Tabs>

Everything has been set up and ready to use. In future, you will only edit the routes configuration
to add new pages or change existing ones.