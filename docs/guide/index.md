# What is Reactive Route?

Reactive Route is a lightweight, flexible, and reactive router for JavaScript applications.

### Framework and State Management Agnostic

The core routing logic is framework-agnostic, allowing it to be used with different UI frameworks and 
state management solutions. Currently, Reactive Route provides official implementations for:

- React + MobX
- React + Observable
- Solid.js + Solid.js reactivity
- Solid.js + MobX
- Solid.js + Observable

### Config-based Routing

Routes are defined using a simple, declarative configuration object:

```typescript
const routes = createRouterConfig({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => /^\d+$/.test(value),
    },
    query: {
      phone: (value) => value.length > 0 && value.length < 10,
    },
    loader: () => import('./pages/user'),
  },
  notFound: {
    path: '/not-found',
    props: { errorCode: 404 },
    loader: () => import('./pages/error'),
  },
  internalError: {
    path: '/internal-error',
    props: { errorCode: 500 },
    loader: () => import('./pages/error'),
  },
});
```

### Type Safety

Built with TypeScript, Reactive Route provides excellent type safety and developer experience. The router configuration and all APIs are fully typed.

### Navigation Guards

Powerful navigation guards allow you to control the navigation flow:

```typescript
const routes = createRouterConfig({
  protected: {
    path: '/protected',
    loader: () => import('./pages/protected'),
    async beforeEnter() {
      if (!isAuthenticated()) {
        return { route: 'login' };
      }
    },
    async beforeLeave({ nextRoute }) {
      if (nextRoute.name === 'user') {
        throw Object.assign(new Error(''), { name: 'PREVENT_REDIRECT' });
      }
    },
  },
});
```

### Server-Side Rendering

Full support for server-side rendering in both React and Solid.js, making it suitable for modern web applications that require SSR.

In the following sections, we'll explore how to install and use Reactive Route in your applications.