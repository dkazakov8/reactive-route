# Router Configuration

The router configuration is the heart of Reactive Route. It defines all the routes in your application, their paths, parameters, and behavior.

## Creating a Router Configuration

Use the `createRouterConfig` function to create a router configuration:

```typescript
import { createRouterConfig } from 'reactive-route';

export const routes = createRouterConfig({
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

### Basic Route Properties

```typescript
home: {
  path: '/',                        // URL path
  loader: () => import('./Home'),   // Component loader
  props: { title: 'Home' },         // Props to pass to the component (optional)
}
```

### Route Properties Reference

| Property | Type                                                                                                           | Description                                                                                       |
|----------|----------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `path` | `string`                                                                                                       | The URL path for the route. Can include dynamic segments prefixed with `:`                        |
| `loader` | `() => Promise<{ default, pageName, ...rest }>`                                                                | A function that returns a Promise resolving to the component (it should be in the default export) |
| `props` | `Record<string, any>`                                                                                          | Static props to pass to the component (optional)                                                  |
| `params` | `Record<string, (value: string) => boolean>`                                                                   | Validation functions for path parameters (required if route type is Dynamic)                             |
| `query` | `Record<string, (value: string) => boolean>`                                                                   | Validation functions for query parameters (optional)                                              |
| `beforeEnter` | `(config: { currentRoute, nextRoute }) => Promise<void \| { route: string, params?: object, query?: object }>` | Hook called before entering the route (optional)                                                  |
| `beforeLeave` | `(config: { currentRoute, nextRoute }) => Promise<void>`                                                       | Hook called before leaving the route (optional)                                                   |

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

Validation function is required and if it's not satisfied, the user will be redirected to "notFound" route.
So, if the page is rendered, be sure that all the params are validated and present in `router.currentRoute`

### Routes with Query Parameters

You can define validation for query parameters:

```typescript
search: {
  path: '/search',
  query: {
    text: (value) => value.length > 0,
  },
  loader: () => import('./pages/Search'),
}
```

Validation function is required and if it's not satisfied, the parameter will be inaccessible from the
store. It means that all the query parameters are optional and may be `undefined` in `router.currentRoute`

## Navigation Guards

Navigation guards allow you to control the navigation flow in your application. Both are async functions

The `beforeEnter` hook is called before entering a route. It can be used to redirect to another route, 
to perform authentication checks and to load some data.

The `beforeLeave` hook is called before leaving a route. It can be used to prevent navigation or 
to show a confirmation dialog.

```typescript
dashboard: {
  path: '/dashboard', 
  loader: () => import('./pages/protected'),
  async beforeEnter() {
    await api.loadUser();
    
    if (!isAuthenticated()) {
      return { route: 'login' };
    }
    
    await api.loadDashboard();
  },
  async beforeLeave({ nextRoute }) {
    const hasUnsavedChanges = await api.checkSavedForm();
    
    if (hasUnsavedChanges) {
      throw Object.assign(new Error(''), { name: 'PREVENT_REDIRECT' });
    }
    
    if (nextRoute.name === 'user') {
      throw Object.assign(new Error(''), { name: 'PREVENT_REDIRECT' });
    }
  },
}
```

Uncatched errors in `beforeEnter` or `beforeLeave` will lead to the rendering of "internalError" route,
so be sure to handle errors here with `try-catch` or `Promise.catch()`.

## Next Steps

Now that you understand how to configure routes, you can learn about the [Router Store](/guide/router-store) to see how to use the router in your application.