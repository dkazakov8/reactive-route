```ts
createRoutes({
  user: {
    path: '/user/:id',
    params: {
      id: (value) => /^\d+$/.test(value)
    },
    loader: () => import('./pages/user'),
    
    children: {
      default: {
        path: 'default/:id',
        params: {
          id: (value) => /[a-z]/.test(value)
        },
        loader: () => import('./pages/user/view'),
      },
      user: {
        path: 'view/:id',
        params: {
          id: (value) => /[a-z]/.test(value)
        },
        loader: () => import('./pages/user/view'),
      }
    }
  },
});
```