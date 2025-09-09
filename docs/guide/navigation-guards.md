# Navigation Guards

Navigation guards are hooks that allow you to control the navigation flow in your application. They can be used to implement authentication, prevent navigation when there are unsaved changes, or redirect users to different routes based on certain conditions.

## Types of Navigation Guards

Reactive Route provides two types of navigation guards:

1. **beforeEnter**: Called before entering a route
2. **beforeLeave**: Called before leaving a route

## beforeEnter Guard

The `beforeEnter` guard is called before navigating to a route. It can be used to:

- Redirect to another route (e.g., redirect to login if the user is not authenticated)
- Perform data loading before showing the route
- Validate route parameters

### Syntax

```typescript
beforeEnter(config) {
  // config contains information about the current and next routes
  const { currentRoute, nextRoute } = config;
  
  // Return a Promise
  return Promise.resolve();
  
  // Or redirect to another route
  return Promise.resolve({ route: 'anotherRoute' });
  
  // Or redirect with parameters
  return Promise.resolve({
    route: 'anotherRoute',
    params: { id: '123' },
    query: { q: 'search' },
  });
}
```

### Example: Authentication Guard

```typescript
const routes = createRouterConfig({
  dashboard: {
    path: '/dashboard',
    beforeEnter(config) {
      if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        return Promise.resolve({
          route: 'login',
          query: { returnTo: 'dashboard' },
        });
      }
      return Promise.resolve();
    },
    loader: () => import('./pages/Dashboard'),
  },
  login: {
    path: '/login',
    loader: () => import('./pages/Login'),
  },
});
```

### Example: Data Loading

```typescript
const routes = createRouterConfig({
  user: {
    path: '/user/:id',
    params: {
      id: (value) => /^\d+$/.test(value),
    },
    beforeEnter(config) {
      const userId = config.nextRoute.params.id;
      
      return fetchUser(userId)
        .then((user) => {
          if (!user) {
            // User not found, redirect to 404
            return { route: 'error404' };
          }
          
          // Store the user data for the component
          userStore.setCurrentUser(user);
          
          return;
        })
        .catch((error) => {
          // Error fetching user, redirect to 500
          return { route: 'error500' };
        });
    },
    loader: () => import('./pages/User'),
  },
});
```

## beforeLeave Guard

The `beforeLeave` guard is called before navigating away from a route. It can be used to:

- Prevent navigation when there are unsaved changes
- Show a confirmation dialog before leaving the route
- Clean up resources before leaving the route

### Syntax

```typescript
beforeLeave(config) {
  // config contains information about the current and next routes
  const { currentRoute, nextRoute } = config;
  
  // Allow navigation
  return Promise.resolve();
  
  // Prevent navigation
  throw new Error('PREVENT_REDIRECT');
}
```

### Example: Unsaved Changes

```typescript
const routes = createRouterConfig({
  editor: {
    path: '/editor',
    beforeLeave(config) {
      if (hasUnsavedChanges()) {
        // Prevent navigation if there are unsaved changes
        throw new Error('PREVENT_REDIRECT');
      }
      return Promise.resolve();
    },
    loader: () => import('./pages/Editor'),
  },
});
```

### Example: Confirmation Dialog

```typescript
const routes = createRouterConfig({
  editor: {
    path: '/editor',
    beforeLeave(config) {
      if (hasUnsavedChanges()) {
        return new Promise((resolve, reject) => {
          const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
          
          if (confirmed) {
            resolve();
          } else {
            reject(new Error('PREVENT_REDIRECT'));
          }
        });
      }
      return Promise.resolve();
    },
    loader: () => import('./pages/Editor'),
  },
});
```

## Guard Execution Order

When navigating from route A to route B, the guards are executed in the following order:

1. `beforeLeave` guard of route A
2. `beforeEnter` guard of route B

If any guard rejects or throws an error, the navigation is cancelled.

## Accessing Route Information

The `config` parameter passed to the guards contains information about the current and next routes:

```typescript
beforeEnter(config) {
  const { currentRoute, nextRoute } = config;
  
  console.log('Current route:', currentRoute?.name);
  console.log('Next route:', nextRoute.name);
  console.log('Next route params:', nextRoute.params);
  console.log('Next route query:', nextRoute.query);
  
  return Promise.resolve();
}
```

## Global Navigation Guards

Reactive Route doesn't provide global navigation guards out of the box, but you can implement them by creating a higher-order function that wraps the route guards:

```typescript
function withAuthGuard(routeConfig) {
  const originalBeforeEnter = routeConfig.beforeEnter;
  
  return {
    ...routeConfig,
    beforeEnter(config) {
      // Global guard
      if (!isAuthenticated()) {
        return Promise.resolve({
          route: 'login',
          query: { returnTo: config.nextRoute.name },
        });
      }
      
      // Original guard
      if (originalBeforeEnter) {
        return originalBeforeEnter(config);
      }
      
      return Promise.resolve();
    },
  };
}

const routes = createRouterConfig({
  dashboard: withAuthGuard({
    path: '/dashboard',
    loader: () => import('./pages/Dashboard'),
  }),
  profile: withAuthGuard({
    path: '/profile',
    loader: () => import('./pages/Profile'),
  }),
  // Public routes
  login: {
    path: '/login',
    loader: () => import('./pages/Login'),
  },
});
```

## Error Handling

If a guard throws an error or rejects a promise, the navigation is cancelled. You can use this to prevent navigation, but it's recommended to use the `PREVENT_REDIRECT` error name for clarity:

```typescript
beforeLeave(config) {
  if (hasUnsavedChanges()) {
    throw Object.assign(new Error(''), { name: 'PREVENT_REDIRECT' });
  }
  return Promise.resolve();
}
```

For other types of errors, the router will navigate to the error500 route specified when creating the router store.

## Next Steps

Now that you understand how to use navigation guards, you can learn about framework-specific integration:

- [React Integration](/guide/react)
- [Solid.js Integration](/guide/solid)