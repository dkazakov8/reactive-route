# Getting Started

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

### Modules map

<<< @/modulesMap.ts

## Basic Setup

### 1. Create a Router Store and Define Your Routes

First, create a router store using the `createRouter` function and 
your routes configuration using the `createRoutes` function:

```typescript [router.ts]
import { createRoutes, createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

export function getRouter() {
  const routes = createRoutes({
    home: {
      path: '/',
      loader: () => import('./pages/home'),
    },
    user: {
      path: '/user/:id',
      params: {
        id: (value) => /^\d+$/.test(value),
      },
      query: {
        phone: (value) => value.length > 0 && value.length < 10,
      },
      loader: () => import('./pages/user'),
    },
    notFound: {
      path: '/not-found',
      props: { errorCode: 404 },
      loader: () => import('./pages/error'),
    },
    internalError: {
      path: '/internal-error',
      props: { errorCode: 500 },
      loader: () => import('./pages/error'),
    },
  });

  
  return createRouter({ adapters, routes });
}
```

Routes `notFound` and `internalError` are required for error handling in the library. Their
configuration is fully customizable as any other routes.

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

::: code-group
```tsx [react]
import { createContext } from 'react';

export const RouterContext = createContext(
  undefined as unknown as { router: ReturnType<typeof getRouter> }
);
```

```tsx [preact]
import { createContext } from 'preact';

export const RouterContext = createContext(
  undefined as unknown as { router: ReturnType<typeof getRouter> }
);
```

```tsx [solid]
import { createContext } from 'solid-js';

export const RouterContext = createContext(
  undefined as unknown as { router: ReturnType<typeof getRouter> }
);
```

```vue [vue]
<script lang="ts" setup>
import { InjectionKey, inject, provide } from 'vue';

export interface Store {
  router: ReturnType<typeof getRouter>;
}

export const StoreKey: InjectionKey<Store> = Symbol('Store');

export function provideStore(store: Store) {
  provide(StoreKey, store);
}

export function useStore(): Store {
  const store = inject(StoreKey);

  if (!store) throw new Error('Store is not provided');

  return store;
}
</script>
```
:::

### 2. Set Up the Router Component

Create a custom Router component that uses the context to access the router store:

```tsx [components/Router.tsx]
import { useContext } from '{ui-library}';
import { Router } from 'reactive-route/{ui-library}';

import { RouterContext } from './RouterContext';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```

### 3. Initialize the router and render

```tsx [client.tsx]
import { RouterContext } from './RouterContext';
import { getRouterStore } from './router';
import { Router } from './components/Router';

const router = getRouterStore();

await router.restoreFromURL({
  pathname: location.pathname + location.search,
});

// the implementation is dependent on the UI library
render(
  element,
  <RouterContext.Provider value={{ router }}>
    <Router />
  </RouterContext.Provider>
);
```
