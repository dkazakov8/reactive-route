
Во многих роутерах используется похожий подход, однако часто конфигурация передается
массивом:

```ts
// vue-router
const configs = [
  { name: 'home', path: '/', component: Home }
]

// @kitbag/router
const configs = [
  createRoute({ name: 'home', path: '/', component: Home })
]
```

В этом случае могут быть коллизии имен, когда несколько имеют одинаковый `name`,
и TypeScript не подскажет об ошибке. Reactive Route использует более типобезопасный
подход, когда `name: 'home'` добавляется автоматически и равен ключу в объекте.

Также в библиотеке минимизировано количество бойлерплейта - не нужно на каждый
`Config` вызывать отдельную функцию или конструктор

```tsx
// mobx-router
const configs = {
  home: new Route({ path: '/', component: <Home /> })
}

// @tanstack/react-router
const rootRoute = createRootRoute()
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})
const routeTree = rootRoute.addChildren([indexRoute])
```

Достаточно верхнеуровнево обернуть в `createConfigs` - это самый минималистичный
и при этом типобезопасный подход среди всех библиотек для роутинга.
