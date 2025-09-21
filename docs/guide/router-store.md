# Router Store

The router store is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouter` function.

## Creating a Router Store

```typescript
import {createRouter} from 'reactive-route';
import {adapters} from 'reactive-route/adapters/{reactive-system}';

import {routes} from './routes';

//  If you prefer Context and SSR
export function getRouter() {
    return createRouter({routes, adapters});
}

//  If you prefer singletons
export const router = createRouter({routes, adapters})
```

The `createRouter` function accepts an object with the following properties:

| Property | Type                  | Description |
|----------|-----------------------|-------------|
| `routes` | `ReturnType<typeof createRoutes>` | The router configuration |
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

| Property | Type                                       | Description                  |
|----------|--------------------------------------------|------------------------------|
| `currentRoute` | `TypeCurrentRoute<typeof routes['route']>` | The current route data       |
| `routesHistory` | `Array<string>`                            | The history of visited paths |
| `isRedirecting` | `boolean`                                  | The indicator of redirecting |
| `redirectTo` | `(config: TypeRedirectToParams): Promise<void>`                   | The navigation function      |
| `restoreFromURL` | `(params: { pathname: string }): Promise<void>`                      | To restore from url          |
| `restoreFromServer` | `(obj: InterfaceRouterStore): Promise<void>`                | To restore from object       |

### redirectTo

Navigates to a specified route:

```typescript
await router.redirectTo({
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

## Server-Side Rendering

For server-side rendering, you need to initialize the router store on both the server and the client:


## Next Steps

Now that you understand how to use the router store, you can learn about [Navigation Guards](/guide/navigation-guards) to control the navigation flow in your application.
