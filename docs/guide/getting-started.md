# Getting Started

This guide will help you set up Reactive Route in your application and create your first routes.

### Installation

The package includes the core router, React and Solid.js implementations, and adapters for different state management solutions.
Note that every combination requires corresponding libraries to be installed in your project.

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
import { createRoutes, createRouter } from 'reactive-route';
import { Router } from 'reactive-route/react';
import { Router } from 'reactive-route/solid';
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-react';
import { adapters } from 'reactive-route/adapters/mobx-preact';
import { adapters } from 'reactive-route/adapters/mobx-solid';
import { adapters } from 'reactive-route/adapters/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

## Basic Setup

### 1. Define Your Routes

First, define your routes using the `createRoutes` function:

```typescript
// routes.ts
import { createRoutes } from 'reactive-route';

export const routes = createRoutes({
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
```

Pages "notFound" and "internalError" are required for error handling in the library.

### 2. Create a Router Store

Next, create a router store using the `createRouter` function and your routes configuration:

```typescript
// router.ts
import { createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

import { routes } from './routes';

//  If you prefer Context and SSR
export function getRouter() {
  return createRouter({ routes, adapters });
}

//  If you prefer singletons
export const router = createRouter({ routes, adapters })
```

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

```typescript
// StoreContext.tsx
import { createContext } from '{ui-library}';

import { getRouter } from './router';

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

  return <RouterLib routes={routes} router={router} />;
}
```

### 4. Initialize the router and render

```tsx
// entry.tsx
import { StoreContext } from './StoreContext';
import { getRouterStore } from './router';
import { Router } from './components/Router';

const router = getRouterStore();

await router.restoreFromURL({
  pathname: location.pathname + location.search,
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
