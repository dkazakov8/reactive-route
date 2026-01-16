```ts
home: { // Static
  path: '/',
  loader: () => import('./pages/home')
},
user: { // Dynamic
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  loader: () => import('./pages/user')
}
```