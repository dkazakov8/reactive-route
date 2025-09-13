# Router Store

The router store is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouterStore` function.

## Creating a Router Store

```typescript
import { createRouterStore } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

import { routes } from './routes';

//  If you prefer Context and SSR
export function getRouter() {
  return createRouterStore({ routes, adapters });
}

//  If you prefer singletons
export const router = createRouterStore({ routes, adapters })
```

The `createRouterStore` function accepts an object with the following properties:

| Property | Type                  | Description |
|----------|-----------------------|-------------|
| `routes` | `ReturnType<typeof createRouterConfig>` | The router configuration |
| `adapters` | `TypeAdapters`              | Adapters for the state management system |

You may pass your own adapters if they satisfy the model

```typescript
type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;
  observer?: (comp: any) => any;
};
```

## Router Store API

The router store provides several methods for navigation and state management:

### redirectTo

Navigates to a specified route:

```typescript
await routerStore.redirectTo({
  route: 'about',
  // with dynamic parameters
  params: { id: '123' },
  // with query parameters
  query: { q: 's' },
  // if you want to replace history state instead of pushing,
  // the user will not be able to come back
  noHistoryPush: true,
});
```

This function is fully TypeScript-typed, and TypeScript hints will be shown for autocomplete.

```typescript
const routes = createRouterConfig({
  static: {
    path: '/static',
    loader: () => import('./pages/static'),
  },
  dynamic: {
    path: '/page/:foo',
    params: {
      foo: (value: string) => value.length > 0,
    },
    query: {
      q: (value: string) => value.length > 0,
    },
    loader: () => import('./pages/dynamic'),
  },
});

// Good
redirectTo({ route: 'static' })
redirectTo({ route: 'dynamic', params: { foo: 'bar' } })
redirectTo({ route: 'dynamic', params: { foo: 'bar' }, query: { q: 's' } })

// TS errors
redirectTo({ });
redirectTo({ route: 'nonExisting' });
redirectTo({ route: 'static', params: {} });
redirectTo({ route: 'dynamic' });
redirectTo({ route: 'dynamic', params: {} });
redirectTo({ route: 'dynamic', params: { a: 'b' } });
redirectTo({ route: 'dynamic', params: { foo: 'bar' }, query: { some: 'value' } });
```

### restoreFromURL

Initializes the basic route from the current URL:

```typescript
// Client-side
await routerStore.restoreFromURL({
  pathname: location.pathname + location.search,
});

// Server-side
await routerStore.restoreFromURL({
  pathname: req.originalUrl,
});
```

### restoreFromServer

Initializes the basic route from an object, for example SSR-prepared data:

```typescript
await routerStore.restoreFromServer({ routesHistory, currentRoute });
```

### currentRoute

```typescript
const currentRoute = routerStore.currentRoute;
```

The current route object has the following properties:

| Property | Type                                                  | Description                                                       |
|----------|-------------------------------------------------------|-------------------------------------------------------------------|
| `name` | `string (keyof typeof routes)`                        | The name of the route                                             |
| `path` | `string (typeof routes[keyof typeof routes]['path'])` | The path of the route                                             |
| `params` | `Record<string, string>`                              | The parameters of the route                                       |
| `query` | `Record<string, string>`                              | The query parameters of the route                                 |
| `props` | `Record<string, any>`                                 | The props for the component                                       |
| `pageName` | `string`                                 | The name of the page, if exported from the page loader (optional) |

## Using the Router Store

### In React

In React applications, you can access the router store using the context:

```tsx
import { useContext } from 'react';
import { StoreContext } from './StoreContext';

function NavigationButton() {
  const { routerStore } = useContext(StoreContext);

  const handleClick = () => {
    routerStore.redirectTo({ route: 'about' });
  };

  return <button onClick={handleClick}>Go to About</button>;
}
```

### In Solid.js

In Solid.js applications, you can access the router store using the context:

```tsx
import { useContext } from 'solid-js';
import { StoreContext } from './StoreContext';

function NavigationButton() {
  const { routerStore } = useContext(StoreContext);

  const handleClick = () => {
    routerStore.redirectTo({ route: 'about' });
  };

  return <button onClick={handleClick}>Go to About</button>;
}
```

## Accessing Route Parameters

You can access the parameters of the current route:

```typescript
const currentRoute = routerStore.getCurrentRoute();
const userId = currentRoute.params.id;
```

## Accessing Query Parameters

You can access the query parameters of the current route:

```typescript
const currentRoute = routerStore.getCurrentRoute();
const searchQuery = currentRoute.query.q;
```

## Handling Navigation Events

You can subscribe to navigation events using the state management system of your choice. For example, with MobX:

```typescript
import { reaction } from 'mobx';

reaction(
  () => routerStore.getCurrentRoute(),
  (currentRoute) => {
    console.log('Route changed:', currentRoute.name);
  }
);
```

## Server-Side Rendering

For server-side rendering, you need to initialize the router store on both the server and the client:

### Server

```typescript
// server.js
import { getRouterStore } from './routerStore';
import { StoreContext } from './StoreContext';

async function renderApp(url) {
  const routerStore = getRouterStore();

  await routerStore.restoreFromURL({
    pathname: url,
    fallback: 'notFound',
  });

  // Render the app with the initialized router store
  const appHtml = renderToString(
    <StoreContext.Provider value={{ routerStore }}>
      <App />
    </StoreContext.Provider>
  );

  // Serialize the router store state for client-side hydration
  const initialState = {
    routerStore: routerStore.toJSON(),
  };

  return { appHtml, initialState };
}
```

### Client

```typescript
// client.js
import { getRouterStore } from './routerStore';
import { StoreContext } from './StoreContext';

async function hydrate() {
  const initialState = window.__INITIAL_STATE__;
  const routerStore = getRouterStore();

  await routerStore.restoreFromServer(initialState.routerStore);

  // Hydrate the app with the initialized router store
  hydrateRoot(
    document.getElementById('app'),
    <StoreContext.Provider value={{ routerStore }}>
      <App />
    </StoreContext.Provider>
  );
}
```

## Next Steps

Now that you understand how to use the router store, you can learn about [Navigation Guards](/guide/navigation-guards) to control the navigation flow in your application.
