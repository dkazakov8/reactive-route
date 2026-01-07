```ts obj
dashboard: {
  path: '/dashboard',
  loader: () => import('./pages/dashboard'),
  async beforeEnter({ redirect }) {
    await api.loadUser();

    if (!store.isAuthenticated()) {
      return redirect({ name: 'login', query: { returnTo: 'dashboard' } });
    }

    await api.loadDashboard();
  }
}
```