```tsx
<!-- @include: @shared/library.md#mobx-router -->

const configs = {
  home: new Route({ path: '/', component: <Home /> })
}

<!-- @include: @shared/library.md#@tanstack/react-router -->

const rootRoute = createRootRoute()
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})
const routeTree = rootRoute.addChildren([indexRoute])
```