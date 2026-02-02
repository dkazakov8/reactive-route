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
  props: { foo: 'bar' },
  async beforeEnter({ nextState, redirect }) {
    await api.loadUser();

    if (!store.isLoggedIn) {
      return redirect({ 
        name: 'login', 
        query: { returnTo: nextState.name }
      });
    }
  },
  async beforeLeave({ nextState, preventRedirect }) {
    if (nextState.name === 'home') {
      return preventRedirect();
    }
  }
}
```