```ts
createConfigs({
  one: {
    path: '/1',
    loader: () => import('./pages/one'),
  },
  two: {
    path: '/2',
    loader: () => import('./pages/two'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'one' });
    },
  },
  three: {
    path: '/3',
    loader: () => import('./pages/three'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'two' });
    },
  },
  four: {
    path: '/4',
    loader: () => import('./pages/four'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'three' });
    },
  },
  
  // other Configs
});
```