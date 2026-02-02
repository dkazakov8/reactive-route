```ts
createConfigs({
  dashboard: {
    path: '/dashboard/:tab',
    params: {
      tab: (value) => ['table', 'widgets', 'charts'].includes(value)
    },
    query: {
      editMode: (value) => ['0', '1', '2'].includes(value)
    },
    loader: () => import('./pages/dashboard'),
  }

  // other Configs
});
```