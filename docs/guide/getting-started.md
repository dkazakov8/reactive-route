# Getting Started

This guide will help you set up Reactive Route in your application and create your first routes.

### Installation

The package includes the core router, React and Solid.js implementations, and adapters for different state management solutions.

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

```typescript
import { createRouterConfig, createRouterStore } from 'reactive-route';
import { Router } from 'reactive-route/react';
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx';
import { adapters } from 'reactive-route/adapters/solid';
import { adapters } from 'reactive-route/adapters/kr-observable';
```

## Basic Setup

### 1. Define Your Routes

First, define your routes using the `createRouterConfig` function:

```typescript
// routes.ts
import { createRouterConfig } from 'reactive-route';

export const routes = createRouterConfig({
  home: {
    path: '/',
    loader: () => import('./pages/Home'),
  },
  about: {
    path: '/about',
    loader: () => import('./pages/About'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => /^\d+$/.test(value),
    },
    loader: () => import('./pages/User'),
  },
  notFound: {
    path: '/404',
    loader: () => import('./pages/NotFound'),
  },
});
```

### 2. Create a Router Store

Next, create a router store using the `createRouterStore` function and your routes configuration:

```typescript
// routerStore.ts
import { createRouterStore } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

import { routes } from './routes';

//  If you prefer Context
export function getRouter() {
  return createRouterStore({ routes, routeError500: routes.notFound, adapters });
}

//  If you prefer singletons
export const router = createRouterStore({ routes, routeError500: routes.notFound, adapters })
```

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

```typescript
// StoreContext.tsx
import { createContext } from '{ui-library}';

import { getRouter } from './routerStore';

export const StoreContext = createContext(
  undefined as unknown as { router: ReturnType<typeof getRouter> }
);
```

### 3. Set Up the Router Component

Create a custom Router component that uses the context to access the router store:

```tsx
// components/Router.tsx
import { useContext } from '{ui-library}';
import { Router as RouterLib } from 'reactive-route/{ui-library}';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return <RouterLib routes={routes} routerStore={router} />;
}
```

### 4. Initialize the router and render

```tsx
// entry.tsx
import { StoreContext } from './StoreContext';
import { getRouterStore } from './routerStore';
import { Router } from './components/Router';

const router = getRouterStore();

await router.restoreFromURL({
  pathname: location.pathname + location.search,
  fallback: 'notFound',
});

render(
  element,
  <StoreContext.Provider value={{ router }}>
    <Router />
  </StoreContext.Provider>
);
```

## Navigation

### Programmatic Navigation

You can navigate programmatically using the router store:

```tsx
import { useContext } from '{ui-library}';
import { StoreContext } from './StoreContext';

function NavigationButton() {
  const { router } = useContext(StoreContext);

  const handleClick = () => {
    router.redirectTo({ 
      route: 'about', 
      params: { id: 'foo' }, 
      query: { foo: 'bar' } 
    });
  };

  return <button onClick={handleClick}>Go to About</button>;
}
```

## Next Steps

Now that you have a basic understanding of how to set up and use Reactive Route, you can explore more advanced features:

- [Router Configuration](/guide/router-configuration) - Learn more about configuring routes
- [Router Store](/guide/router-store) - Explore the router store API
- [Navigation Guards](/guide/navigation-guards) - Control navigation with guards
- [Framework Integration](/guide/react) - Detailed guides for React and Solid.js
