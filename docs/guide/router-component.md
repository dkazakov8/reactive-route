# Router Component Configuration

The router is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouter` function.

## Creating a Router Component

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

The `Router` accepts these props:

| Property                    | Type                                   | Description                                                                                                      |
|-----------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `routes`                    | `ReturnType<typeof createRoutes>`      | The routes configuration                                                                                         |
| `router`                    | `ReturnType<typeof createRouter>`      | The router configuration                                                                                         |
| `beforeMount`               | `() => void`                           | This function is called once on Router Component initiation, before any rendering (optional)                     |
| `beforeUpdatePageComponent` | `() => void`                           | This function is called when page component is changed, before `beforeSetPageComponent` and rendering (optional) |
| `beforeSetPageComponent`    | `(componentConfig: TypeRoute) => void` | This function is called when page component is loaded, before rendering (optional)                               |

```tsx
// components/Router.tsx
import { useContext } from '{ui-library}';
import { Router as RouterLib } from 'reactive-route/{ui-library}';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return (
    <RouterLib
      routes={routes}
      router={router}
      beforeMount={() => {
        // RouterLib just mounted
      }}
      beforeUpdatePageComponent={() => {
        // some new page will be rendered soon (not called on first render!)
        // You may stop async actions and clear modular stores here
  
        cancelExecutingApi();
        cancelExecutingActions();
        someStore.reset();
      }}
      beforeSetPageComponent={(route) => {
        // some page will be rendered soon
        // You may initiate modular stores here
        
        console.log(route); // shows which page will be loaded
        
        const myPageStore = route.otherExports.myPageStore;
      }}
    />
  );
}
```

### redirectTo

Navigates to a specified route:

```typescript
await router.redirectTo({
  route: 'about',
  // with dynamic parameters
  params: { id: '123' },
  // with query parameters
  query: { q: 's' },
  // if you want to replace history state instead of pushing
  noHistoryPush: true,
});
```

This function is fully TypeScript-typed, and TypeScript hints will be shown for autocomplete.

```typescript
const routes = createRoutes({
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
  
  // other routes
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
await router.restoreFromURL({
  pathname: location.pathname + location.search,
});

// Server-side
await router.restoreFromURL({
  pathname: req.originalUrl,
});
```

### restoreFromServer

Initializes the basic route from an object, for example SSR-prepared data:

```typescript
await router.restoreFromServer({ routesHistory, currentRoute });
```

### currentRoute

```typescript
import { TypeCurrentRoute } from 'reactive-route';

const currentRoute = router.currentRoute 
  as TypeCurrentRoute<typeof routes.dynamic>;
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

Note that TS-typing is static and `currentRoute` is not necessarily this one. When redirecting finished,
it will become a new route instance, so if you use `autorun` to track current params, check `currentRoute.name` first.

## isRedirecting

If you need to show loaders on redirects, you may use this parameter. For global loader:

```tsx
const GlobalHeader = () => {
  const { router } = useContext(StoreContext);
  
  return router.isRedirecting ? <Loader /> : null;
}
```

Or for a local one:

```tsx
const GlobalHeader = () => {
  const { router } = useContext(StoreContext);
  
  return <Button isLoading={router.isRedirecting} />;
}
```

## routesHistory

This array includes all the visited paths and may be used for logging or to check from which route
the user came to the current page.
