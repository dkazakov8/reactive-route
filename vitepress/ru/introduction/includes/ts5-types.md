
```ts
/** Для динамических Config необходимы валидаторы */

// TS2322: Type is not assignable to type 
// TypeConfigConfigurable<"/user/:id/:tab">
// Property "params" is missing but required in type 
// { params: { id: TypeValidator; tab: TypeValidator }; }
const configs = createConfigs({
  user: {
    path: '/user/:id/:tab',
    loader: () => import('./pages/user'),
  }
})

// No errors
const configs = createConfigs({
  user: {
    path: '/user/:id/:tab',
    params: {
      id: (value) => /^\d+$/.test(value),
      tab: (value) => ['settings', 'payments', 'general'].includes(value)
    },
    loader: () => import('./pages/user'),
  }
})

/** Для статических Config - наоборот, запрещены */

// TS2322: Type { foo: (value: string) => boolean; } 
// is not assignable to type "never"
const configs = createConfigs({
  home: {
    path: '/',
    params: {
      foo: (value) => value.length > 2,
    },
    loader: () => import('./pages/home'),
  }
})

// No errors
const configs = createConfigs({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  }
})
```
