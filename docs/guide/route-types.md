# Route Types

### Static Routes

Static routes have fixed paths without parameters:

```typescript
home: {
  path: '/',
  loader: () => import('./pages/Home'),
},
about: {
  path: '/about',
  loader: () => import('./pages/About'),
},
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
},
```

### Routes with Query Parameters

You can define validation for query parameters:

```typescript
search: {
  path: '/search',
  query: {
    text: (value) => value && value.length > 0,
  },
  loader: () => import('./pages/Search'),
},
```