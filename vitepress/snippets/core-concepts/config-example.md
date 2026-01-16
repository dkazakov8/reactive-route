```ts
user: {
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  query: {
    phone: (value) => value.length < 15
  },
  loader: () => import('./pages/user'),
  async beforeEnter({ redirect }) {
    await api.loadUser();

    if (store.isAuthenticated()) return redirect({ name: 'dashboard' });
  },
  async beforeLeave({ nextRoute, preventRedirect }) {
    if (nextRoute.name === 'home') return preventRedirect();
  }
}
```