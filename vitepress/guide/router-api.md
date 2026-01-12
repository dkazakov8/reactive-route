# Router API

## createRouter

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>routes</code></td>
<td class="table-td">

```ts
ReturnType<typeof createRoutes>
```

</td>
<td>An object with Route <code>Configs</code></td>
</tr><tr>
<td><code>adapters</code></td>
<td class="table-td">

[TypeAdapters](#typeadapters)

</td>
<td>Adapters for the reactivity system</td>
</tr><tr>
<td><code>beforeComponentChange?</code></td>
<td class="table-td">

```ts
(params: {
  prevState?: TypeRouteState;
  prevConfig?: TypeRouteConfig;
  currentState: TypeRouteState;
  currentConfig: TypeRouteConfig;
}) => void
```

</td>
<td>This is a global lifecycle function that executes only when the rendered component changes (not route!)</td>
  </tr></tbody>
</table>

## router.redirect


Navigates to a specified Route `Payload` and returns a `url` parameter of internally created Route `State`:

```typescript
const targetURL = await router.redirect({
  route: 'user',
  params: { id: '9999' },
  query: { phone: '123456' }
}) 
// '/user/9999?phone=123456'
```

This function is fully typed, and TypeScript hints will be shown for autocomplete.

```typescript
createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => value.length > 0,
    },
    query: {
      phone: (value) => value.length > 0,
    },
    loader: () => import('./pages/user'),
  },
  
  // other Configs
});

// Good
redirect({ route: 'home' })
redirect({ route: 'user', params: { id: '123' } })
redirect({ route: 'user', params: { id: '123' }, query: { phone: '321' } })

// TS errors

// no "route" key
redirect({});
// no Config with this name
redirect({ route: 'nonExisting' });
// home Config is a static route, params should not be passed
redirect({ route: 'home', params: {} });
// user Config is a dynamic route, params should be present
redirect({ route: 'user' });
// params.id should be present
redirect({ route: 'user', params: {} });
// not existing params.a was passed
redirect({ route: 'user', params: { id: '123', a: 'b' } });
// not existing query.a was passed
redirect({ route: 'user', params: { id: '123' }, query: { a: 'b' } });
```

## router.createRoutePayload

Accepts a pathname+search string and returns `Payload`

```ts
console.log(router.createRoutePayload(`/user/9999?phone=123456&gtm=value`))

// { 
//  route: 'user', 
//  params: { id: '9999' }, 
//  query: { phone: '123456' }
// }
```

Note that all the unrelevant or invalid query parameters are not present.

## router.hydrateFromURL

Just an alias for `router.redirect(router.createRoutePayload(locationString))`.
So, it accepts a pathname+search string and returns a `url` parameter of internally created Route `State`

```ts
const clearedURL = await router.hydrateFromURL(
  `/user/9999?phone=123456&gtm=value`
)
// '/user/9999?phone=123456'

// in CSR is usually used like this
await router.hydrateFromURL(`${location.pathname}${location.search}`)

// in SSR is usually used like this (with Express.js)
const clearedURL = await router.hydrateFromURL(req.originalUrl)
// if you want to remove the unrelevant query params 
// and unify slashes format
if (req.originalUrl !== clearedURL) res.redirect(clearedURL)
```

Note that all the unrelevant or invalid query parameters are stripped of the `clearedURL`

## router.hydrateFromState

Accepts a `router.state` from an object and makes all the necessary preparations for rendering.

```ts
await router.hydrateFromState({ 
  state: {
    user: {
      name: 'user',
      params: { id: '9999' },
      pathname: '/user/9999',
      props: undefined,
      query: { phone: '123456' },
      search: 'phone=123456',
      url: '/user/9999?phone=123456',
      isActive: true
    }
  }
})
```

This function is intended to be used with SSR, so it does not call any lifecycle functions because
they have already been called on server. So use it only to restore state from the server.

## router.state

A reactive object with route names as keys and Route `State` as values, for example:

```ts
console.log(route.state.user)
// {
//   name: 'user',
//   params: { id: '9999' },
//   pathname: '/user/9999',
//   props: undefined,
//   query: { phone: '123456' },
//   search: 'phone=123456',
//   url: '/user/9999?phone=123456',
//   isActive: true
// }
```

Is intended to be used to show some values in UI or for writing logic in autoruns/effects.







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
  const { router } = useContext(RouterContext);
  
  return router.isRedirecting ? <Loader /> : null;
}
```

Or for a local one:

```tsx
const GlobalHeader = () => {
  const { router } = useContext(RouterContext);
  
  return <Button isLoading={router.isRedirecting} />;
}
```

## routesHistory

This array includes all the visited paths and may be used for logging or to check from which route
the user came to the current page.



## TypeAdapters

You may pass your own adapters if they satisfy the exported type.
This may be useful for integration of your own reactivity system.

```typescript
type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <T extends Record<string, any>>(obj: T, newObj: T) => void;
  makeObservable: <T extends Record<string, any>>(obj: T) => T;
  observer?: (component: any) => any;
};
```