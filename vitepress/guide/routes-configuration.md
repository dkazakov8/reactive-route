# Routes Configuration

The router configuration is the heart of Reactive Route. It defines all the routes in your application, their paths, parameters, and behavior.

Use the `createRoutes` function to create a router configuration:

```typescript
import { createRoutes } from 'reactive-route';

const routes = createRoutes({
  // Your route definitions go here.

  // These routes are required
  notFound: {
    path: '/not-found',
    loader: () => import('./pages/error'),
  },
  internalError: {
    path: '/internal-error',
    loader: () => import('./pages/error'),
  },
});
```

## Route Definition

Each route is defined as a key-value pair in the configuration object. The key is the route name, and the value is an object with the route configuration.

| Property      | Type                                             | Description                                                                                           |
|---------------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `path`        | `string`                                         | The URL path for the route. Can include dynamic segments prefixed with `:`                            |
| `loader`      | `() => Promise<{ default, pageId, ...rest }>`    | A function that returns a Promise resolving to the component (it should be in the **default** export) |
| `props`       | `Record<string, any>`                            | Static props to pass to the component (optional)                                                      |
| `params`      | `Record<string, (value: string) => boolean>`     | Validation functions for path parameters (required if route type is Dynamic)                          |
| `query`       | `Record<string, (value: string) => boolean>`     | Validation functions for query parameters (optional)                                                  |
| `pageId`      | `string`                                         | An optimization for nested routes to avoid page's rerender (optional)                                 |
| `beforeEnter` | `(config: TypeLifecycleConfig) => Promise<void>` | Hook called before entering the route (optional)                                                      |
| `beforeLeave` | `(config: TypeLifecycleConfig) => Promise<void>` | Hook called before leaving the route (optional)                                                       |

## Route Types

### Static Routes

Static routes have fixed paths without parameters:

```typescript
home: {
  path: '/',
  loader: () => import('./pages/Home'),
}
```

### Dynamic Routes

Dynamic routes have parameters in their paths, indicated by a colon prefix:

```typescript
user: {
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value), // Validation function
  },
  loader: () => import('./pages/User'),
}
```

A validation function is required, and if it's not satisfied, the user will be redirected to the "notFound" route.
If the page is rendered, you can be sure that all the params are validated and present in `router.currentRoute`.

### Routes with Query Parameters

Both Static Routes and Dynamic Routes may have query parameters:

```typescript
search: {
  path: '/search',
  query: {
    text: (value) => value.length > 0,
  },
  loader: () => import('./pages/Search'),
}
```

A validation function is required, and if it's not satisfied, the parameter will be inaccessible from the
store. This means that all query parameters are optional and may be `undefined` in `router.currentRoute`.

## Navigation Guards

Navigation guards allow you to control the navigation flow in your application. Both `beforeEnter` and `beforeLeave` are async functions.

The `beforeEnter` hook is called before entering a route. It can be used to redirect to another route, 
perform authentication checks, and load data.

The `beforeLeave` hook is called before leaving a route. It can be used to prevent navigation or 
show a confirmation dialog.

```typescript
dashboard: {
  path: '/dashboard', 
  loader: () => import('./pages/protected'),
  async beforeEnter(config) {
    await api.loadUser();

    if (!isAuthenticated()) {
      return config.redirect({ route: 'login', query: { return: 'dashboard' } });
    }

    await api.loadDashboard();
  },
  async beforeLeave(config) {
    const hasUnsavedChanges = await api.checkSavedForm();

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        `You have unsaved changes. Are you sure you want to leave?`
      );

      if (!confirmed) return config.preventRedirect();
    }

    if (config.nextRoute.name === 'user') {
      return config.preventRedirect();
    }
  },
}
```

Always remember to use `return` with `config.redirect` and `config.preventRedirect` to ensure proper flow control.

Uncaught errors in `beforeEnter` or `beforeLeave` will lead to the rendering of the "internalError" route,
so it's important to handle errors properly using `try-catch` blocks or `Promise.catch()` methods.

Note that `beforeEnter` is called on dynamic parameter changes, but not called on query changes.
This behavior may become configurable in future versions.

### Accessing Route Information

The `config` is an object with parameters as follows:

```typescript
type TypeLifecycleConfig = {
  nextUrl: string;
  nextRoute: any;
  nextPathname: string;
  nextQuery?: any;
  nextSearch?: string;

  currentUrl?: string;
  currentQuery?: any;
  currentRoute?: any;
  currentSearch?: string;
  currentPathname?: string;

  redirect: (params: any) => void;
  preventRedirect: () => void;
};
```

Be careful with `config.redirect` function. It accepts the same route data as `router.redirect`,
but is not typed. So, if you refactor your routes, TS errors will not be shown here which may lead to
incorrect redirects.

### Accessing Custom Parameters in Lifecycle Hooks

Both `beforeEnter` and `beforeLeave` support passing custom parameters. These parameters are passed through
`createRouter({ lifecycleParams })` as will be described in the next section of the documentation.

```typescript
const routes = createRoutes({
  dashboard: {
    path: '/dashboard',
    loader: () => import('./pages/protected'),
    async beforeEnter(config, userStore: UserStore, uiStore: UIStore) {
      if (!userStore.isAuthenticated()) {
        return config.redirect({ route: 'login' });
      }
    },
    async beforeLeave(config, userStore, uiStore) {
      console.log(userStore, uiStore);
    },
  },

  // Other routes
});

createRouter({ routes, lifecycleParams: [new UserStore(), new UIStore()] })
```

This approach may not be necessary for CSR-only projects with singletons, as you can simply import `userStore`
and `uiStore` directly. However, for SSR projects, it's a powerful helper because you can't use singletons
in that context, and each store needs to be created for every request.
