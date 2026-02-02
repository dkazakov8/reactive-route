```ts
// [!code error]
// TS2322: Type is not assignable to type [!code error]
// TypeConfigConfigurable<"/user/:id/:tab"> [!code error]
// Property "params" is missing but required in type [!code error]
// { params: { id: TypeValidator; tab: TypeValidator }; }

const configs = createConfigs({
  user: {
    path: '/user/:id/:tab',
    loader: () => import('./pages/user'),
  }
})
  
// [!code warning]
// TS valid 

const configs = createConfigs({
  user: {
    path: '/user/:id/:tab',
    params: {
      id: (value) => /^\d+$/.test(value),
      tab: (value) => ['settings', 'payments'].includes(value)
    },
    loader: () => import('./pages/user'),
  }
})

// [!code error]
// TS2322: Type { foo: (value: string) => boolean; } [!code error]
// is not assignable to type "never"

const configs = createConfigs({
  staticPage: {
    path: '/static-page',
    params: {
      foo: (value) => value.length > 2,
    },
    loader: () => import('./pages/static'),
  }
})

// [!code warning]
// TS valid

const configs = createConfigs({
  staticPage: {
    path: '/static-page',
    loader: () => import('./pages/static'),
  }
})
```
