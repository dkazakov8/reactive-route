# Router Store

The router store is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouterStore` function.

## Creating a Router Store

```typescript
import { createRouterStore } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/mobx'; // or any other adapter

import { routes } from './routes';

export function getRouterStore() {
  return createRouterStore({
    routes,
    routeError500: routes.error500, // Fallback route for errors
    adapters,
  });
}
```

## Router Store Configuration

The `createRouterStore` function accepts an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `object` | The router configuration created with `createRouterConfig` |
| `routeError500` | `object` | The route to use when an error occurs |
| `adapters` | `object` | Adapters for the state management system |

## Router Store API

The router store provides several methods for navigation and state management:

### redirectTo

Navigates to a specified route:

```typescript
routerStore.redirectTo({
  route: 'about',
});
```

With parameters:

```typescript
routerStore.redirectTo({
  route: 'user',
  params: { id: '123' },
});
```

With query parameters:

```typescript
routerStore.redirectTo({
  route: 'search',
  query: { q: 'reactive-route' },
});
```

### restoreFromURL

Initializes the router from the current URL:

```typescript
await routerStore.restoreFromURL({
  pathname: location.pathname + location.search,
  fallback: 'notFound', // Route to use if the URL doesn't match any route
});
```

### restoreFromServer

Initializes the router from server-side data (for SSR):

```typescript
await routerStore.restoreFromServer(serverData);
```

### getCurrentRoute

Returns the current route:

```typescript
const currentRoute = routerStore.getCurrentRoute();
```

The current route object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the route |
| `path` | `string` | The path of the route |
| `params` | `object` | The parameters of the route |
| `query` | `object` | The query parameters of the route |
| `Component` | `React.ComponentType` or `SolidJS.Component` | The component for the route |
| `props` | `object` | The props for the component |

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
