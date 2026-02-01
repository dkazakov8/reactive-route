
```ts
/** Для динамических Config необходимы валидаторы */

// TS2322: Type is not assignable to type 
// TypeConfigConfigurable<"/user/:id/:tab">
// Property "params" is missing but required in type 
// { params: { id: TypeValidator; tab: TypeValidator }; }
const routes = createRoutes({
  user: {
    path: '/user/:id/:tab',
    loader: () => import('./pages/user'),
  }
})

// No errors
const routes = createRoutes({
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
const routes = createRoutes({
  home: {
    path: '/',
    params: {
      foo: (value) => value.length > 2,
    },
    loader: () => import('./pages/home'),
  }
})

// No errors
const routes = createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  }
})
```
