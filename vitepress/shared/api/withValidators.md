```ts
users: {
  path: '/users',  // no validators
  loader: () => import('./pages/users')
},
userDetails: {
  path: '/user/:id',  // "id" is a param matched by the validator
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  loader: () => import('./pages/userDetails')
}
```