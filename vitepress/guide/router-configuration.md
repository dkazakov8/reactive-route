# Router Configuration

The router is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouter` function.

## Creating a Router Store

```typescript [router.ts]
import { createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

const routes = createRoutes({ 
  // ...your config 
});

//  If you prefer Context and SSR
export function getRouter() {
  return createRouter({ routes, adapters });
}

//  If you prefer singletons
export const router = createRouter({ routes, adapters })
```

The `createRouter` function accepts an object with the following properties:

| Property          | Type                              | Description                                                |
|-------------------|-----------------------------------|------------------------------------------------------------|
| `routes`          | `ReturnType<typeof createRoutes>` | The routes configuration                                   |
| `adapters`        | `TypeAdapters`                    | Adapters for the state management system                   |
| `lifecycleParams` | `Array<any>`                      | Built-in DI for `beforeEnter` and `beforeLeave` (optional) |

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

## Router API

The router store provides several methods for navigation and state management:

| Property            | Type                                            | Description                  |
|---------------------|-------------------------------------------------|------------------------------|
| `currentRoute`      | `TypeCurrentRoute<typeof routes['routeKey']>`   | The current route data       |
| `routesHistory`     | `Array<string>`                                 | The history of visited paths |
| `isRedirecting`     | `boolean`                                       | The indicator of redirecting |
| `redirect`          | `(config: TypeRedirectToParams): Promise<void>` | The navigation function      |
| `restoreFromURL`    | `(params: { pathname: string }): Promise<void>` | To restore from url          |
| `restoreFromServer` | `(obj: TypeRouter): Promise<void>`              | To restore from object       |
| `routes`            | `ReturnType<typeof createRoutes>`               | Routes configuration         |
| `lifecycleParams`   | `Array<any>`                                    | Custom lifecycle parameters  |

### redirect

Navigates to a specified route:

```typescript
await router.redirect({
  route: 'about',
  // with dynamic parameters
  params: { id: '123' },
  // with query parameters
  query: { q: 's' },
  // if you want to replace history state instead of pushing
  replace: true,
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
redirect({ route: 'static' })
redirect({ route: 'dynamic', params: { foo: 'bar' } })
redirect({ route: 'dynamic', params: { foo: 'bar' }, query: { q: 's' } })

// TS errors
redirect({ });
redirect({ route: 'nonExisting' });
redirect({ route: 'static', params: {} });
redirect({ route: 'dynamic' });
redirect({ route: 'dynamic', params: {} });
redirect({ route: 'dynamic', params: { a: 'b' } });
redirect({ route: 'dynamic', params: { foo: 'bar' }, query: { some: 'value' } });
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
  // use your framework's way to get the full path + search
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
  as TypeCurrentRoute<typeof router.routes.dynamic>;
```

The current route object has the following properties:

| Property   | Type                                                  | Description                                                       |
|------------|-------------------------------------------------------|-------------------------------------------------------------------|
| `name`     | `string (keyof typeof routes)`                        | The name of the route                                             |
| `path`     | `string (typeof routes[keyof typeof routes]['path'])` | The path of the route                                             |
| `params`   | `Record<string, string>`                              | The parameters of the route                                       |
| `query`    | `Record<string, string>`                              | The query parameters of the route                                 |
| `props`    | `Record<string, any>`                                 | The props for the component                                       |
| `pageId` | `string`                                              | The name of the page, if exported from the page loader (optional) |

Note that TS-typing is static and `currentRoute` is not necessarily this one. When redirecting is finished,
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
