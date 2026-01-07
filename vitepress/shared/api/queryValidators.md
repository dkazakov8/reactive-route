```ts
search: {
  path: '/search',
  query: {
    userPrompt: (value) => value.length > 5
  },
  loader: () => import('./pages/search')
}
```