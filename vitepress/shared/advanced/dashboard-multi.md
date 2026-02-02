```ts
createConfigs({
  dashboard: {
    path: '/dashboard',
    loader: () => import('./pages/dashboard'),
  },
  dashboardEdit: {
    path: '/dashboard/edit',
    loader: () => import('./pages/dashboard'),
  },
  dashboardAggregate: {
    path: '/dashboard/aggregate',
    loader: () => import('./pages/dashboard'),
  }
});
```