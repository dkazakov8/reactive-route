```ts
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
```