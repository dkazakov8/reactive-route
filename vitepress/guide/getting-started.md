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

//  If you prefer Context and SSR
export function getRouter() {
  return createRouter({ routes, adapters });
}

//  If you prefer singletons
export const router = createRouter({ routes, adapters })
```

Pages `notFound` and `internalError` are required for error handling in the library.

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

```typescript [StoreContext.tsx]
import { createContext } from '{ui-library}';

import { getRouter } from './router';

export const StoreContext = createContext(
  undefined as unknown as { router: ReturnType<typeof getRouter> }
);
```

### 2. Set Up the Router Component

Create a custom Router component that uses the context to access the router store:

```tsx [components/Router.tsx]
import { useContext } from '{ui-library}';
import { Router as RouterLib } from 'reactive-route/{ui-library}';

import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return <RouterLib router={router} />;
}
```

### 3. Initialize the router and render

```tsx [client.tsx]
import { StoreContext } from './StoreContext';
import { getRouterStore } from './router';
import { Router } from './components/Router';

const router = getRouterStore();

await router.restoreFromURL({
  pathname: location.pathname + location.search,
});

// the implementation is dependent on the UI library
render(
  element,
  <StoreContext.Provider value={{ router }}>
    <Router />
  </StoreContext.Provider>
);
```
