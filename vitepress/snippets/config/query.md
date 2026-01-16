```ts
search: {
  path: '/search',
  query: {
    text: (value) => value.length > 1
  },
  loader: () => import('./pages/search')
}
```