# Router Configuration

The router configuration is the heart of Reactive Route. It defines all the routes in your application, their paths, parameters, and behavior.

## Creating a Router Configuration

Use the `createRouterConfig` function to create a router configuration:

```typescript
import { createRouterConfig } from 'reactive-route';

export const routes = createRouterConfig({
  // Route definitions go here
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

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | The URL path for the route. Can include dynamic segments prefixed with `:` |
| `loader` | `() => Promise<any>` | A function that returns a Promise resolving to the component |
| `props` | `object` | Static props to pass to the component (optional) |
| `params` | `Record<string, (value: string) => boolean>` | Validation functions for path parameters (optional) |
| `query` | `Record<string, (value: string) => boolean>` | Validation functions for query parameters (optional) |
| `beforeEnter` | `(config: { currentRoute, nextRoute }) => Promise<void \| { route: string, params?: object, query?: object }>` | Hook called before entering the route (optional) |
| `beforeLeave` | `(config: { currentRoute, nextRoute }) => Promise<void>` | Hook called before leaving the route (optional) |

## Route Types

### Static Routes

Static routes have fixed paths without parameters:

```typescript
about: {
  path: '/about',
  loader: () => import('./About'),
}
```

### Dynamic Routes

Dynamic routes have parameters in their paths, indicated by a colon prefix:

```typescript
user: {
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value), // Validate that id is a number
  },
  loader: () => import('./User'),
}
```

In this example, the `:id` segment in the path is a dynamic parameter. The `params` object defines a validation function for the `id` parameter.

### Nested Routes

You can create nested routes by using slashes in the path:

```typescript
userProfile: {
  path: '/user/:id/profile',
  params: {
    id: (value) => /^\d+$/.test(value),
  },
  loader: () => import('./UserProfile'),
}
```

### Query Parameters

You can define validation for query parameters:

```typescript
search: {
  path: '/search',
  query: {
    q: (value) => value && value.length > 0, // Validate that q is not empty
  },
  loader: () => import('./Search'),
}
```

## Navigation Guards

Navigation guards allow you to control the navigation flow in your application.

### beforeEnter

The `beforeEnter` hook is called before entering a route. It can be used to redirect to another route or to perform authentication checks:

```typescript
dashboard: {
  path: '/dashboard',
  beforeEnter(config) {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      return Promise.resolve({ route: 'login' });
    }
    return Promise.resolve();
  },
  loader: () => import('./Dashboard'),
}
```

### beforeLeave

The `beforeLeave` hook is called before leaving a route. It can be used to prevent navigation or to show a confirmation dialog:

```typescript
editor: {
  path: '/editor',
  beforeLeave(config) {
    if (hasUnsavedChanges()) {
      // Prevent navigation if there are unsaved changes
      throw new Error('PREVENT_REDIRECT');
    }
    return Promise.resolve();
  },
  loader: () => import('./Editor'),
}
```

## Error Routes

It's recommended to define special routes for handling errors:

```typescript
error404: {
  path: '/404',
  props: { errorCode: 404 },
  loader: () => import('./Error'),
},
error500: {
  path: '/500',
  props: { errorCode: 500 },
  loader: () => import('./Error'),
}
```

These routes can be used as fallbacks when a route is not found or when an error occurs during navigation.

## Example Configuration

Here's a complete example of a router configuration:

```typescript
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
  userProfile: {
    path: '/user/:id/profile',
    params: {
      id: (value) => /^\d+$/.test(value),
    },
    loader: () => import('./pages/UserProfile'),
  },
  search: {
    path: '/search',
    query: {
      q: (value) => value && value.length > 0,
    },
    loader: () => import('./pages/Search'),
  },
  dashboard: {
    path: '/dashboard',
    beforeEnter(config) {
      if (!isAuthenticated()) {
        return Promise.resolve({ route: 'login' });
      }
      return Promise.resolve();
    },
    loader: () => import('./pages/Dashboard'),
  },
  login: {
    path: '/login',
    loader: () => import('./pages/Login'),
  },
  error404: {
    path: '/404',
    props: { errorCode: 404 },
    loader: () => import('./pages/Error'),
  },
  error500: {
    path: '/500',
    props: { errorCode: 500 },
    loader: () => import('./pages/Error'),
  },
});
```

## Next Steps

Now that you understand how to configure routes, you can learn about the [Router Store](/guide/router-store) to see how to use the router in your application.